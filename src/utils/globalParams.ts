export function getGlobalParams(): object {
    let params = localStorage.getItem("globalParams")
    if (params) {
        return JSON.parse(params)
    }
    return {}
}

export function setGlobalParams(params: any): void {
    localStorage.setItem("globalParams", params)
}

