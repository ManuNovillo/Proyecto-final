let host = "http://localhost:8000/";

async function getSessionToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function createUser(userData) {
    console.log("Creating user", userData.id);
    const response = await fetch(`${host}users/create/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "email" : userData.email,
            "supabase_id" : userData.supabase_id,
            "nickname" : userData.nickname,
            
        }),
    })
    if (!response.ok) {
        console.error('Error creating user:', response.statusText);
        throw new Error('Error creating user');
    }
    const user = response.json();
    return user;
}

export async function createPost() {
    
}

export async function loadPosts(url, page) {
    const response = await fetch(`${host}${url}?page=${page}`);
    const posts = await response.json();
    return posts;
}

export async function getUser(supabaseId) {
    const response = await fetch(`${host}users/${supabaseId}`);
    if (!response.ok) {
        console.error('Error getting user:', response.statusText);
        throw new Error('Error getting user');
    }
    const user = response.json();
    return user;
}