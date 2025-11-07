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
import { hostname } from 'os';
import { useStoreState } from 'easy-peasy';
import ipwho_is from './api-ip/ipwho.is';
import geoiplookup_io from './api-ip/geoiplookup.io';
import ipapi_is from './api-ip/ipapi.is';
import ipapi_co from './api-ip/ipapi.co';
import DNSGoogle from './api-dns/DNSGoogle';
import DNSCloudflare from './api-dns/DNSCloudflare';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const IPAPIConnects: {[key: string]: any} = {
    'ipwho.is': ipwho_is,
    'geoiplookup.io': geoiplookup_io,
    'ipapi.is': ipapi_is,
    'ipapi.co': ipapi_co
};

const DNSAPIConnects: {[key: string]: any} = {
    'DNS-Google': DNSGoogle,
    'DNS-Cloudflare': DNSCloudflare
};

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
        /^0\./
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

    const dns_api = useStoreState((state) => state.settings.data!.region_api!.dns);
    const ip_api = useStoreState((state) => state.settings.data!.region_api!.ip);
    
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

    const address = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return !match ? '' : `http://${match.alias || ip(match.ip)}`;
    });

    useEffect(() => {
        if (serverIp && ip_api && dns_api) {
            const fetchIpInfo = async (ip: string): Promise<void> => {
                try {
                    var ip_matcher = /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/;
                    let url_request = IPAPIConnects[ip_api].getAPIconnect();
                    if (isLocalIPAddress(ip)) {
                        const my_hostname = hostname();
                        if (!isLocalIPAddress(my_hostname)) {
                            if (ip_matcher.test(my_hostname)) {
                                url_request += IPAPIConnects[ip_api].addHostname(my_hostname);
                            } else {
                                const ip_response_from_dns = await DNSAPIConnects[dns_api].getIP(my_hostname);
                                if (ip_response_from_dns) {
                                    url_request += IPAPIConnects[ip_api].addHostname(ip_response_from_dns);
                                } else {
                                    setIpInfo({
                                        city: "Unknown",
                                        country_name: "DNS Error",
                                        country_code: "N/A",
                                    });
                                }
                            }
                        }
                    } else {
                        if (ip_matcher.test(ip)) {
                            url_request += IPAPIConnects[ip_api].addHostname(ip);
                        } else {
                            const ip_response_from_dns = await DNSAPIConnects[dns_api].getIP(ip);
                            if (ip_response_from_dns) {
                                url_request += IPAPIConnects[ip_api].addHostname(ip_response_from_dns);
                            } else {
                                setIpInfo({
                                    city: "Unknown",
                                    country_name: "DNS Error",
                                    country_code: "N/A",
                                });
                            }
                        }
                    }
                    console.log(url_request);
                    const response = await axios.get(url_request);
                    const parseData = IPAPIConnects[ip_api].fetchInfo(response.data);
                    if (parseData) {
                        setIpInfo({
                            city: parseData.city,
                            country_name: parseData.country_name,
                            country_code: parseData.country_code,
                        });
                    } else {
                        setIpInfo({
                            city: "Unknown",
                            country_name: "IP API Error",
                            country_code: "N/A",
                        });
                    }
                } catch (error) {
                    console.error(error);
                    setIpInfo({
                        city: "Unknown",
                        country_name: "Parse Error",
                        country_code: "N/A",
                    });
                }
            };

            fetchIpInfo(serverIp);
        } else {
            setIpInfo(null);
        }
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
                <a href={address} target='_blank'>{allocation}</a>
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