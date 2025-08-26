import React, { useEffect, useMemo, useState } from 'react';
import {
    faClock,
    faCloudDownloadAlt,
    faCloudUploadAlt,
    faHdd,
    faMemory,
    faMicrochip,
    faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';
import StatBlock from '@/components/server/console/StatBlock';
import RegionStatBlock from '@/components/server/console/RegionStatBlock';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import classNames from 'classnames';
import { capitalize } from '@/lib/strings';
import axios from 'axios';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const getBackgroundColor = (value: number, max: number | null): string | undefined => {
    const delta = !max ? 0 : value / max;

    if (delta > 0.8) {
        if (delta > 0.9) {
            return 'bg-red-500';
        }
        return 'bg-yellow-500';
    }

    return undefined;
};

const Limit = ({ limit, children }: { limit: string | null; children: React.ReactNode }) => (
    <>
        {children}
        <span className={'ml-1 text-gray-300 text-[70%] select-none'}>/ {limit || <>&infin;</>}</span>
    </>
);

const RegionNameLimit = ({ limit, children }: { limit: string | null; children: React.ReactNode }) => (
    <>
        {children}
        <span className={'ml-1 text-gray-300 text-[70%] select-none'}>, {limit || <>&infin;</>}</span>
    </>
);

interface IPData {
    city: string;
    country_name: string;
    country_code: string;
}

function isLocalIPAddress(ipAddress: string) {
  if (!ipAddress) {
    return false;
  }

  const localIPPatterns = [
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^::1$/,
    /^fe80:/,
  ];

  for (const pattern of localIPPatterns) {
    if (pattern.test(ipAddress)) {
      return true;
    }
  }

  return false;
}

const ServerDetailsBlock = ({ className }: { className?: string }) => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });
    const [ipInfo, setIpInfo] = useState<IPData | null>(null);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);

        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    const serverIp = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return !match ? null : ip(match.ip);
    });

    useEffect(() => {
        if (!serverIp) {
            setIpInfo(null);
            return;
        }

        const fetchIpInfo = async (ipOrHost: string) => {
            try {
                let queryIp = ipOrHost;
                const ipv4Regex = /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/;

                // Resolve hostname via Cloudflare DoH if needed
                if (!ipv4Regex.test(ipOrHost)) {
                    const dnsRes = await axios.get(
                        `https://cloudflare-dns.com/dns-query?name=${ipOrHost}&type=A`,
                        { headers: { Accept: 'application/dns-json' } }
                    );
                    const answer = dnsRes.data?.Answer?.find((a: any) => a.type === 1);
                    if (answer) queryIp = answer.data;
                }

                // Local/private IP handling
                if (isLocalIPAddress(queryIp)) {
                    setIpInfo({
                        city: 'Local',
                        country_name: 'Private Network',
                        country_code: 'LAN',
                    });
                    return;
                }

                // Fetch geolocation from ipwhois.io
                const geoRes = await axios.get(`https://ipwhois.app/json/${queryIp}`);
                const data = geoRes.data;

                setIpInfo({
                    city: data.city || 'Unknown',
                    country_name: data.country || 'Unknown',
                    country_code: data.country_code || 'N/A',
                });
            } catch (error: any) {
                setIpInfo({
                    city: 'Error',
                    country_name: error.message || 'Unknown',
                    country_code: 'N/A',
                });
            }
        };

        fetchIpInfo(serverIp);
    }, [serverIp]);

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
    });

    return (
        <div className={classNames('grid grid-cols-6 gap-2 md:gap-4', className)}>
            <StatBlock icon={faWifi} title={'Address'} copyOnClick={allocation}>
                {allocation}
            </StatBlock>
            <StatBlock
                icon={faClock}
                title={'Uptime'}
                color={getBackgroundColor(status === 'running' ? 0 : status !== 'offline' ? 9 : 10, 10)}
            >
                {status === null ? (
                    'Offline'
                ) : stats.uptime > 0 ? (
                    <UptimeDuration uptime={stats.uptime / 1000} />
                ) : (
                    capitalize(status)
                )}
            </StatBlock>
            <StatBlock icon={faMicrochip} title={'CPU Load'} color={getBackgroundColor(stats.cpu, limits.cpu)}>
                {status === 'offline' ? (
                    <span className={'text-gray-400'}>Offline</span>
                ) : (
                    <Limit limit={textLimits.cpu}>{stats.cpu.toFixed(2)}%</Limit>
                )}
            </StatBlock>
            <StatBlock
                icon={faMemory}
                title={'Memory'}
                color={getBackgroundColor(stats.memory / 1024, limits.memory * 1024)}
            >
                {status === 'offline' ? (
                    <span className={'text-gray-400'}>Offline</span>
                ) : (
                    <Limit limit={textLimits.memory}>{bytesToString(stats.memory)}</Limit>
                )}
            </StatBlock>
            <StatBlock icon={faHdd} title={'Disk'} color={getBackgroundColor(stats.disk / 1024, limits.disk * 1024)}>
                <Limit limit={textLimits.disk}>{bytesToString(stats.disk)}</Limit>
            </StatBlock>
            <StatBlock icon={faCloudDownloadAlt} title={'Network (Inbound)'}>
                {status === 'offline' ? <span className={'text-gray-400'}>Offline</span> : bytesToString(stats.rx)}
            </StatBlock>
            <StatBlock icon={faCloudUploadAlt} title={'Network (Outbound)'}>
                {status === 'offline' ? <span className={'text-gray-400'}>Offline</span> : bytesToString(stats.tx)}
            </StatBlock>
            {ipInfo && (
                <RegionStatBlock icon_name={ipInfo.country_code} title={'Region'}>
                    <RegionNameLimit limit={ipInfo.city}>{ipInfo.country_name}</RegionNameLimit>
                </RegionStatBlock>
            )}
        </div>
    );
};

export default ServerDetailsBlock;
