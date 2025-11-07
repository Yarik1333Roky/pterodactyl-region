import axios from 'axios';

const getIP = async (hostname: string) => {
    console.log(`https://dns.google/resolve?name=${hostname}`)
    const response_from_dns = await axios.get(`https://dns.google/resolve?name=${hostname}`);
    const jsonData_from_dns = response_from_dns.data;
    if (jsonData_from_dns && jsonData_from_dns.Status === 0) {
        return jsonData_from_dns.Answer[0].data;
    } else {
        return null;
    }
}

export default { getIP }