export function getGlobalParams(): object {
    // let params = localStorage.getItem("globalParams")
    let params = sessionStorage.getItem("globalParams")
    if (params) {
        console.log(params)
        return JSON.parse(params)
    }
    return {}
}

export function setGlobalParams(params: any): void {
    // localStorage.setItem("globalParams", params)
    sessionStorage.setItem("globalParams", params)
}

// getCountry
export function getCountry(): string {
    // return localStorage.getItem("country") || ""
    return sessionStorage.getItem("country") || ""
}

export function setCountry(country: string): void {
    // localStorage.setItem("country", country)
    sessionStorage.setItem("country", country)
}

