import axios from './axios'

export interface Hero {
    id:number ,
    path_image: string,
    is_active:boolean
}

export const getHeroes = async():Promise<Hero[]> =>{
    const response = await axios.get('/hero')
    return response.data  
}

export const saveHero = async (data:{path_image:string}):Promise<Hero> => { 
    const response = await axios.post(`/hero`,data)
    return response.data
}