const getAPIconnect = () => {
    return 'https://ipwho.is';
}

const addHostname = (ip: string) => {
    return `/${ip}`;
}

const fetchInfo = (data: any) => {
    if (data && data.ip) {
        return {
            city: data.city,
            country_name: data.country,
            country_code: data.country_code,
        };
    } else {
        return null;
    }
}

export default { getAPIconnect, addHostname, fetchInfo }