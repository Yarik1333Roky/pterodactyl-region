const getAPIconnect = () => {
    return 'https://ipapi.co';
}

const addHostname = (ip: string) => {
    return `/${ip}/json`;
}

const fetchInfo = (data: any) => {
    if (data && data.ip) {
        return {
            city: data.city,
            country_name: data.country_name,
            country_code: data.country_code,
        };
    } else {
        return null;
    }
}

export default { getAPIconnect, addHostname, fetchInfo }