import { supabase } from './index.js'

let host = "http://localhost:8000/"

async function getSessionToken() {
  const { data, error } = await supabase.auth.getSession()
  if (data) {
    console.log('Session data:', data)
  }
  if (error) {
    console.error('Error getting session:', data.error)
    throw new Error('Error getting session')
  }
  return data?.session?.access_token
}

export async function createUser(userData) {
    console.log("Creating user", userData.id)
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
        console.error('Error creating user:', response.statusText)
        throw new Error('Error creating user')
    }
    const user = response.json()
    return user
}

export async function createPost(post) {
    const token = await getSessionToken()
    console.log('Creating post with token:', token)
    const response = await fetch(`${host}posts/create/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(post),
    })
    if (!response.ok) {
        console.error('Error creating post:', response.statusText)
        throw new Error('Error creating post')
    }
}

export async function loadPosts(url, date, requiresToken) {
    console.log("URL ES", url)
    let response
    console.log("Date es", date)
    if (requiresToken) {
    const token = await getSessionToken()
    response = await fetch(`${host}${url}?date=${date}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
    } else {
        response = await fetch(`${host}${url}?date=${date}`)
    }
    const posts = await response.json()
    return posts
}

export async function getUser(supabaseId) {
    const response = await fetch(`${host}users/${supabaseId}`)
    if (!response.ok) {
        console.error('Error getting user:', response.statusText)
        throw new Error('Error getting user')
    }
    const user = response.json()
    return user
}

export async function updateUser(user) {
    const response = await fetch(`${host}users/update/${user.id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    })
    if (!response.ok) {
        console.error('Error updating user:', response.statusText)
        throw new Error('Error updating user')
    }
    const updatedUser = response.json()
    return updatedUser
}

export async function getUserByName(nickname) {
    const response = await fetch(`${host}users/nickname/${nickname}/`)
    if (!response.ok) {
        console.error('Error getting user by nickname:', response.statusText)
        throw new Error('Error getting user by nickname')
    }
    const user = response.json()
    return user
}

export async function followUser(id) {
    const token = await getSessionToken()
    const response = await fetch(`${host}users/follow/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        throw Error('Error following user: ' + response.statusText)
    }
    const followResponse = response.json()
    return followResponse
}

export async function unfollowUser(id) {
    const token = await getSessionToken()
    const response = await fetch(`${host}users/unfollow/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        throw Error('Error unfollowing user: ' + response.statusText)
    }
    const unfollowResponse = response.json()
    return unfollowResponse
}

export async function likePost(id) {
    const token = await getSessionToken()
    const response = await fetch(`${host}posts/${id}/like/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    if (!response.ok) {
        throw Error('Error liking post: ' + response.statusText)
    }
    const likeResponse = response.json()
    return likeResponse
}