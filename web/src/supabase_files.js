import { supabase } from './index.js'
import { v4 as uuidv4 } from 'uuid'

const baseUrl = 'https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures/'

export async function uploadProfilePicture(file, user_id) {
    const { data, error } = await supabase.storage.from('profilepictures').upload(`${user_id}/profilepicture.png`, file, {"cache-control": "3600", "upsert": "true"}) 
    if (data) {
      console.log('File uploaded successfully:', data)
      return `https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures//${data.path}`
    }
    else if (error) {
      console.error('Error uploading file:', error)
      return null
    }
}

export async function uploadPostFile(file) {
    const uuid = uuidv4()
    const { data, error } = await supabase.storage.from('posts').upload(`${uuid}`, file)
    console.log("Full path", data.fullPath)
    console.log("File name", data.name)
    console.log("File type", data.type)
    if (data) {
      console.log('File uploaded successfully:', data)
      console.log('Post created successfully')
      return `https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/posts//${data.path}`
    } else {
      errorText.textContent = 'Error al subir el archivo'
      console.error('Error uploading file:', error)
      return null
    }
}
