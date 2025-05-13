let host = "http://localhost:8000/";

export async function createUser(user) {
    fetch('localhost:8000/users/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

export async function createPost() {
    
}

export async function loadPosts(url, page) {
    const response = await fetch(`${host}${url}?page=${page}`);
    const posts = await response.json();
    return posts;
}

export async function getUser(supabaseId) {
    const response = await fetch(`${host}/users/${supabaseId}`);
    const user = await response.json();
    return user;
}