import React from 'react';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';
import AE from '@/assets/regions/AE.svg';
import AR from '@/assets/regions/AR.svg';
import AT from '@/assets/regions/AT.svg';
import AU from '@/assets/regions/AU.svg';
import BE from '@/assets/regions/BE.svg';
import BG from '@/assets/regions/BG.svg';
import BR from '@/assets/regions/BR.svg';
import CA from '@/assets/regions/CA.svg';
import CH from '@/assets/regions/CH.svg';
import CL from '@/assets/regions/CL.svg';
import CN from '@/assets/regions/CN.svg';
import CO from '@/assets/regions/CO.svg';
import CZ from '@/assets/regions/CZ.svg';
import DE from '@/assets/regions/DE.svg';
import DK from '@/assets/regions/DK.svg';
import EG from '@/assets/regions/EG.svg';
import ES from '@/assets/regions/ES.svg';
import FI from '@/assets/regions/FI.svg';
import FR from '@/assets/regions/FR.svg';
import GB from '@/assets/regions/GB.svg';
import HK from '@/assets/regions/HK.svg';
import IE from '@/assets/regions/IE.svg';
import IL from '@/assets/regions/IL.svg';
import IN from '@/assets/regions/IN.svg';
import IT from '@/assets/regions/IT.svg';
import JP from '@/assets/regions/JP.svg';
import KE from '@/assets/regions/KE.svg';
import KR from '@/assets/regions/KR.svg';
import MA from '@/assets/regions/MA.svg';
import MY from '@/assets/regions/MY.svg';
import NG from '@/assets/regions/NG.svg';
import NL from '@/assets/regions/NL.svg';
import NO from '@/assets/regions/NO.svg';
import NZ from '@/assets/regions/NZ.svg';
import PH from '@/assets/regions/PH.svg';
import PL from '@/assets/regions/PL.svg';
import PT from '@/assets/regions/PT.svg';
import QA from '@/assets/regions/QA.svg';
import RO from '@/assets/regions/RO.svg';
import RU from '@/assets/regions/RU.svg';
import SA from '@/assets/regions/SA.svg';
import SE from '@/assets/regions/SE.svg';
import SG from '@/assets/regions/SG.svg';
import TH from '@/assets/regions/TH.svg';
import TW from '@/assets/regions/TW.svg';
import UA from '@/assets/regions/UA.svg';
import US from '@/assets/regions/US.svg';
import VN from '@/assets/regions/VN.svg';
import TR from '@/assets/regions/TR.svg';
import RS from '@/assets/regions/RS.svg';
import LV from '@/assets/regions/LV.svg';
import LT from '@/assets/regions/LT.svg';
import KZ from '@/assets/regions/KZ.svg';
import IS from '@/assets/regions/IS.svg';
import ID from '@/assets/regions/ID.svg';
import EE from '@/assets/regions/EE.svg';
import BY from '@/assets/regions/BY.svg';
import ZA from '@/assets/regions/ZA.svg';
import GR from '@/assets/regions/GR.svg';
import HR from '@/assets/regions/HR.svg';
import HU from '@/assets/regions/HU.svg';
import KY from '@/assets/regions/KY.svg';
import MD from '@/assets/regions/MD.svg';
import MN from '@/assets/regions/MN.svg';
import MX from '@/assets/regions/MX.svg';
import SI from '@/assets/regions/SI.svg';
import SK from '@/assets/regions/SK.svg';
import TJ from '@/assets/regions/TJ.svg';
import UZ from '@/assets/regions/UZ.svg';


interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon_name: string;
    children: React.ReactNode;
}
const countryCodeToSvg: {[key: string]: any} = {
    AE: AE, AR: AR, AT: AT, AU: AU, BE: BE,
    BG: BG, BR: BR, CA: CA, CH: CH, CL: CL,
    CN: CN, CO: CO, CZ: CZ, DE: DE, DK: DK,
    EG: EG, ES: ES, FI: FI, FR: FR, GB: GB,
    HK: HK, IE: IE, IL: IL, IN: IN, IT: IT,
    JP: JP, KE: KE, KR: KR, MA: MA, MY: MY,
    NG: NG, NL: NL, NO: NO, NZ: NZ, PH: PH,
    PL: PL, PT: PT, QA: QA, RO: RO, RU: RU,
    SA: SA, SE: SE, SG: SG, TH: TH, TW: TW,
    UA: UA, US: US, VN: VN, ZA: ZA, TR: TR,
    RS: RS, LV: LV, LT: LT, KZ: KZ, IS: IS,
    ID: ID, EE: EE, BY: BY, GR: GR, HR: HR,
    HU: HU, KY: KY, MD: MD, MN: MN, MX: MX,
    SI: SI, SK: SK, TJ: TJ, UZ: UZ
};

export default ({ title, copyOnClick, icon_name, color, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div className={classNames(styles.stat_block, 'bg-gray-600')}>
                <div className={classNames(styles.status_bar, color || 'bg-gray-700')} />
                <div className={classNames(styles.icon, color || 'bg-gray-700')}>
                    {countryCodeToSvg[icon_name] ? (
                        <img style={{ height: '2rem', width: '2rem', userSelect: 'none', WebkitUserSelect: 'none' }} src={countryCodeToSvg[icon_name]}/>
                    ) : (
                        <span>{icon_name}</span>
                    )}
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'font-header leading-tight text-xs md:text-sm text-gray-200'}>{title}</p>
                    <div
                        ref={ref}
                        className={'h-[1.75rem] w-full font-semibold text-gray-50 truncate'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};