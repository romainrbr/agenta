import {ListAppsItem} from "@/lib/Types"
import {getAgentaApiUrl} from "@/lib/helpers/utils"
import {axiosFetcher} from "@/lib/services/api"
import {useRouter} from "next/router"
import {PropsWithChildren, createContext, useContext, useMemo} from "react"
import useSWR from "swr"

type AppContextType = {
    currentApp: ListAppsItem | null
    apps: ListAppsItem[]
    error: any
    isLoading: boolean
    mutate: () => void
}

const initialValues: AppContextType = {
    currentApp: null,
    apps: [],
    error: null,
    isLoading: false,
    mutate: () => {},
}

const useApps = () => {
    const {data, error, isLoading, mutate} = useSWR(`${getAgentaApiUrl()}/api/apps/`, axiosFetcher)
    return {
        data: (data || []) as ListAppsItem[],
        error,
        isLoading,
        mutate,
    }
}

export const AppContext = createContext<AppContextType>(initialValues)

export const useAppsData = () => useContext(AppContext)

const appContextValues = {...initialValues}

export const getAppValues = () => appContextValues

const AppContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const {data: apps, error, isLoading, mutate} = useApps()
    const router = useRouter()
    const appId = router.query?.app_id as string

    const currentApp = useMemo(
        () => (!appId ? null : apps.find((item: ListAppsItem) => item.app_id === appId) || null),
        [apps, appId],
    )

    appContextValues.currentApp = currentApp
    appContextValues.apps = apps
    appContextValues.error = error
    appContextValues.isLoading = isLoading
    appContextValues.mutate = mutate

    return (
        <AppContext.Provider value={{currentApp, apps, error, isLoading, mutate}}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
