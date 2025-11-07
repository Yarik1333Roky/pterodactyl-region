const getAPIconnect = () => {
    return 'https://api.ipapi.is';
}

const addHostname = (ip: string) => {
    return `/?q=${ip}`;
}

const fetchInfo = (data: any) => {
    if (data && data.ip) {
        return {
            city: data.location.city,
            country_name: data.location.country,
            country_code: data.location.country_code,
        };
    } else {
        return null;
    }
}

export default { getAPIconnect, addHostname, fetchInfo }