import {create} from 'zustand'

interface location {
    id: number,
    name: string,
    city: string,
    state: string,
    address: string,
    phone: number

}
interface ApiResponse {
    data: location[]
}
interface LocationState {
    locations: location[],
    setLocations: (response: ApiResponse) =>  void,

}
const useLocationStore = create<LocationState>()(
    (set) => ({
    locations : [],
    setLocations: (response: ApiResponse) => {
        const locationdata = response.data
        set({
            locations: locationdata
        })
    }
}))

export default useLocationStore