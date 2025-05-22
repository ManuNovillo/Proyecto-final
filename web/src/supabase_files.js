import { supabase } from './index.js';

const baseUrl = 'https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures/';

export async function uploadProfilePicture(file, user_id) {
    const { data, error } = await supabase.storage.from('profilepictures').upload(`${user_id}/profilepicture.png`, file, {"cache-control": "3600", "upsert": "true"}) ;
    if (data) {
      console.log('File uploaded successfully:', data);
      return `https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures//${data.path}`;
    }
    else if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
}

export async function removeProfilePicture(user_id) {
    const { data, error } = await supabase.storage.from('profilepictures').remove([`${user_id}/profilepicture.png`]);
    if (data) {
      console.log('File removed successfully:', data);
      return true;
    }
    else if (error) {
      console.error('Error removing file:', error);
      return false;
    }
}

export async function updateProfilePicture(file, user_id) {
    const { data, error } = await supabase.storage.from('profilepictures').update(`${user_id}/profilepicture.png`, file, {"cache-control": "3600", "upsert": "true"});
    if (data) {
      console.log('File updated successfully:', data);
      return `${baseUrl}//${data.path}`;
    }
    else if (error) {
      console.error('Error updating file:', error);
      return null;
    }
}