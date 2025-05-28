import { createClient } from '@supabase/supabase-js'
import { getUser, createUser, updateUser, createPost, getUserByName, loadPosts, followUser, unfollowUser, likePost } from './services.js'
import { uploadProfilePicture, uploadPostFile } from './supabase_files.js'

const supabaseUrl = 'https://mwxwlheqcworkzgnkgwj.supabase.co'
const supabaseToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHdsaGVxY3dvcmt6Z25rZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDY2MjAsImV4cCI6MjA2MjAyMjYyMH0.jyWmJI1qxa4MAl5JSh_Bb7fNjEAHwrwdjSC_8hRkoyo'

export const supabase = createClient(supabaseUrl, supabaseToken)

const defaultUserPicture = 'https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures//default-profile-picture.png'

let user = null
let isCreatingAccount = false
let dateLastPostRetrieved = Date.now()
let lastPostId = null
let loading = false
let showingUserPosts = false
let showingLatestPosts = true
let showingFollowingPosts = false
let userFoundId = null

const postContainer = document.getElementById('posts')

const signUpForm = document.getElementById('form-signup')

const loginForm = document.getElementById('form-login')

const profileForm = document.getElementById('form-profile')

const postCreateForm = document.getElementById('post-create-form')

const showLatestPostsButton = document.getElementById('show-latest-posts')

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && !isCreatingAccount) {
    console.log('User signed in auth state:', session)
    user = await getUser(session.user.id)
    updateUIForLoggedInUser()
    console.log('User:', user)
  } else if (event === 'SIGNED_OUT') {
    user = null
    updateUIForLogedOutUser()
  }
})


document.addEventListener('DOMContentLoaded', function () {
  const searchUserForm = document.getElementById('form-search-user')
  searchUserForm.addEventListener('submit', searchUser)

  signUpForm.addEventListener('submit', signup)

  loginForm.addEventListener('submit', login)

  profileForm.addEventListener('submit', updateProfile)

  postCreateForm.addEventListener('submit', uploadPost)

  showLatestPostsButton.addEventListener('click', function() {
    dateLastPostRetrieved = Date.now()
    postContainer.innerHTML = ''
    const userContainer = document.getElementById('user-data')
    userContainer.style.display = 'none'
    postCreateForm.style.display = 'block'
    showLatestPosts()
  })

  const showUserPostsButton = document.getElementById('show-user-posts')
  showUserPostsButton.addEventListener('click', function() {
    dateLastPostRetrieved = Date.now()
    postContainer.innerHTML = ''
    const userContainer = document.getElementById('user-data')
    userContainer.style.display = 'none'
    showFollowingPosts()
  })

  const followButton = document.getElementById('follow-button')
  followButton.addEventListener('click', () => {
    try {
      followUser(userFoundId)
      user.following.push(userFoundId)
      followButton.style.display = 'none'
      unfollowButton.style.display = 'block'
    } catch (exception) {
      console.error('Error following user:', exception)
    }
  })

  const unfollowButton = document.getElementById('unfollow-button')
  unfollowButton.addEventListener('click', () => {
    try {
      unfollowUser(userFoundId)
      user.following = user.following.filter(id => id !== userFoundId)
      unfollowButton.style.display = 'none'
      followButton.style.display = 'block'
    } catch (exception) {
      console.error('Error unfollowing user:', exception)
    }
  })

  showLatestPosts()
})

supabase.auth.getSession().then(async ({ data: { session } }) => {
  if (session) {
    console.log("Sesión activa", session)
  } else {
    user = null
  }
})

async function searchUser(event) {
  event.preventDefault()
  const searchInput = document.getElementById('search-user-input').value
  const errorText = document.getElementById('search-user-error')
  if (searchInput.length == 0) {
    errorText.textContent = 'Introduce un nombre de usuario'
    return
  }
  try {
    const userFound = await getUserByName(searchInput)
    errorText.textContent = ''
    console.log('User found:', userFound)
    userFoundId = userFound.id
    const userContainer = document.getElementById('user-data')
    const followButton = document.getElementById('follow-button')
    const unfollowButton = document.getElementById('unfollow-button')
    followButton.style.display = 'block'
    unfollowButton.style.display = 'block'
    userContainer.style.display = 'block'
    postCreateForm.style.display = 'none'
    if (userFound.id === user?.id) {
      console.log('User found is the same as logged in user');
      followButton.style.display = 'none'
      unfollowButton.style.display = 'none'
    } else if (user?.following?.includes(userFound.id)) {
      followButton.style.display = 'none'
      unfollowButton.style.display = 'block'
    } else {
      followButton.style.display = 'block'
      unfollowButton.style.display = 'none'
    }
    const img = userContainer.querySelector("img")
    img.src = userFound.profile_picture ? `${userFound.profile_picture}?t=${Date.now()}` : defaultUserPicture
    const userFoundName = userContainer.querySelector('h3')
    userFoundName.textContent = userFound.nickname
    const userFoundDescription = userContainer.querySelector('p')
    userFoundDescription.textContent = userFound.description ? userFound.description : ''
    dateLastPostRetrieved = Date.now()
    postContainer.innerHTML = ''
    showUserPosts()
  } catch (exception) {
    errorText.textContent = 'Uusuario no encontrado'
    console.error('Error searching user:', exception)
  }
}

async function signup(event) {
   event.preventDefault()
  const email = document.getElementById('email-signup').value
  const password = document.getElementById('password-signup').value
  const nickname = document.getElementById('nickname').value
  const confirmPassword = document.getElementById('confirm-password-signup').value
  const errorText = document.getElementById('signup-error')
  if (password.length < 8) {
    errorText.textContent = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  if (password !== confirmPassword) {
    errorText.textContent = 'Las contraseñas no coinciden'
    return
  }

  isCreatingAccount = true
  const { data, error } = await supabase.auth.signUp({
    "email": email,
    "password": password,
  })

  if (data.user) {
    console.log('User signed up:', data.user)
    console.log('User id:', data.user.id)
    let myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-signup'))
    myModal.hide()
    try {
      user = await createUser(
        {
          "email": email,
          "supabase_id": data.user.id,
          "nickname": nickname
        }
      )
      console.log('User created:', user)
      updateUIForLoggedInUser()
    } catch (exception) {
      console.error('Error creating user:', exception)
      errorText.textContent = 'Error al crear el usuario'
    }
  } else {
    console.error('Error creating user:', error)
    errorText.textContent = 'Error al crear el usuario'
  }
 
}

async function login(event) {
  event.preventDefault()
  const email = document.getElementById('email-login').value
  const password = document.getElementById('password-login').value
  const errorText = document.getElementById('login-error')
  const { data, error } = await supabase.auth.signInWithPassword({
    "email": email,
    "password": password,
  })

  if (data.user) {
    console.log('User logged in:', data)
    let modalLogin = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-login'))
    try {
      modalLogin.hide()
      console.log('User data:', user)
    } catch (exception) {
      errorText.textContent = 'Error al iniciar sesión'
      console.error('Error logging in:', error)
    }
  } else {
    errorText.textContent = 'Error al iniciar sesión'
    console.error('Error logging in:', error)
  }
}

async function logout() {
  const { error } = await supabase.auth.signOut() 
  if (error) {
    console.error('Error logging out:', error)
  } else {
    console.log('User logged out')
  }
}

function updateUIForLogedOutUser() {
  console.log("Updating UI log in")
  const loginButton = document.getElementById('login-button')
  const profilePictureDiv = document.getElementById('profile-picture-div')
  const postCreateForm = document.getElementById('post-create-form')
  const followButton = document.getElementById('follow-button')
  const showFeedButton = document.getElementById('show-user-posts') 

  loginButton.style.display = 'block'
  profilePictureDiv.style.display = 'none'
  postCreateForm.style.display = 'none'
  followButton.style.display = 'none'
  showFeedButton.style.display = 'none'
}

window.addEventListener('scroll', debounce(handleScroll, 1000))

async function updateProfile(event) {
  event.preventDefault()
  const file = document.getElementById('profile-picture-input').files[0]
  let fileUrl
  if (file) {
    console.log('File selected:', file)
    const user_id = user.supabase_id
    fileUrl = await uploadProfilePicture(file, user_id)
  }
  const description = document.getElementById('profile-description').value
  try {
    console.log('Updating user:', user)
    user = await updateUser({
      "id": user.id,
      "description": description,
      "profile_picture": fileUrl,
    })
    updateUIForLoggedInUser()
  } catch (exception) {
    console.error('Error updating user:', exception)
  }

}

const postFileInput = document.getElementById('post-file-input')
postFileInput.addEventListener('change', function() {
  const file = postFileInput.files[0]
  const fileName = document.getElementById('post-file-name')
  if (file) {
    const icon = file.type.includes('image') ? 'fa-camera' : file.type.includes('video') ? 'fa-video-camera' : 'fa-file';
    fileName.innerHTML = `<i class="fa ${icon} ps-2 me-2" aria-hidden="true"></i> ${file.name}`
  } else {
    fileName.innerHTML = ''
  }
})

const profilePictureInput = document.getElementById('profile-picture-input')
profilePictureInput.addEventListener('change', function() {
  const file = profilePictureInput.files[0]
  const profilePictureName = document.getElementById('profile-picture-name')
  if (file) {
    profilePictureName.innerHTML = `<i class="fa fa-camera ps-2 me-2" aria-hidden="true"></i> ${file.name}`
  } else {
    profilePictureName.innerHTML = ''
  }
})

async function uploadPost(event) {
  event.preventDefault()
  const text = document.getElementById('post-text').value
  const file = document.getElementById('post-file-input').files[0]
  const errorText = document.getElementById('post-error')
  let fileUrl = null
  let fileType = 'none'
  if (file) {
    fileUrl = await uploadPostFile(file)
    if (fileUrl) {
      fileType = file.type.includes('image') ? 'image' : file.type.includes('video') ? 'video' : 'none'
    } else {
      errorText.textContent = 'Error al subir el archivo'
      return
    }
  }
  console.log('User:', user)
  console.log('User id:', user.id)
  createPost({
    "user": user.id,
    "text": text,
    "file": fileUrl,
    "file_type": fileType
  }).then(() => {
    console.log('Post created successfully')
    postCreateForm.reset()
  }).catch((error) => {
    console.error('Error creating post:', error)
  })
}

function updateUIForLoggedInUser() {
  console.log("Updating UI log in")
  const loginButton = document.getElementById('login-button')
  const profilePictureDiv = document.getElementById('profile-picture-div')
  const description = document.getElementById('profile-description')
  const profileTitle = document.getElementById('profile-title')
  const profilePicture = document.querySelectorAll('.profile-picture')
  const postCreateForm = document.getElementById('post-create-form')
  const followButton = document.getElementById('follow-button')
  const showFeedButton = document.getElementById('show-user-posts') 

  loginButton.style.display = 'none'
  profilePictureDiv.style.display = 'block'
  postCreateForm.style.display = 'block'
  followButton.style.display = 'block'
  profileTitle.textContent = `${user.nickname}`
  showFeedButton.style.display = 'inline-block'
  description.value = user.description ? user.description : ''
  profilePicture.forEach(picture => {
    if (user.profile_picture)
      picture.src = `${user.profile_picture}?t=${Date.now()}`
    else
      picture.src = defaultUserPicture
  })
}

async function handleScroll() {
  if (loading === true) return
  if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
    loading = true
    if (showingUserPosts) {
      showUserPosts()
    } else if(showingFollowingPosts) {
      showFollowingPosts()
    } else if (showingLatestPosts) {
      showLatestPosts()
    }
  }
}

function debounce(func, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

async function showPosts(url, requiresToken) {
  const loader = document.getElementById('loader')
  loader.style.display = 'block'
  try {
    const posts = await loadPosts(url, dateLastPostRetrieved, requiresToken)
    if (posts.length > 0) {
      console.log("ES 0")
      dateLastPostRetrieved = new Date(posts[posts.length - 1].date_uploaded).getTime()
      console.log('Ahora la fecha es', dateLastPostRetrieved)
    }
    posts.forEach(post => {
      if (post.id === lastPostId) return
      lastPostId = post.id
      console.log("OAHDJLKAHDLJADHAOL")
      
      console.log(post)
      const date = new Date(post.date_uploaded)
      const day = date.getDate()
      const monthAbbreviation = date.toLocaleString('es-ES', { month: 'short' })
      const year = date.getFullYear()
      let userProfilePicture = post.user.profile_picture ? `${post.user.profile_picture}?t=${Date.now()}`: defaultUserPicture
      let content = `
        <div class="card mx-auto mb-3 bg-transparent-gray border-subtle pb-5">
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <h2>
                              <img src="${userProfilePicture}?t=${Date.now}" width="100" height="100" class="rounded-circle object-cover">
                              <a href='' class="text-decoration-none text-white text-shadow" >${post.user.nickname}</a>
                            </h2>
                        </div>
                        <div class="col-6 text-end">
                            <p class="text-white text-shadow">${day} ${monthAbbreviation} ${year}</p>
                        </div>
                    </div> `
      content += post.file_type === 'image' ?
        `<img class="card-img-top object-cover"
                        src="${post.file}"
                        alt="Post image" />`

        : post.file_type === 'video' ?
          `<video controls class="card-img-top"
                       src="${post.file}"></video>`
          : ''
      content +=
        `<p class="card-text text-white pt-3">${post.text}</p>
          <div class="position-absolute bottom-0 end-0 p-2 text-center text-white">
            <p><button class="like-button btn btn-link text-white text-decoration-none" data-id="${post.id}">
              <span class="pe-3">${post.likes}</span><i class="fa fa-thumbs-up fa-2x" aria-hidden="true"></i>
            </button></p>
          </div>
                </div>
            </div>
       `
      postContainer.innerHTML += content
    })
    loading = false
    loader.style.display = 'none'
  } catch (error) {
    console.error('Error loading posts:', error)
    postContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            Error loading posts
        </div>
      `
  }
}

function showLatestPosts() {
  showingLatestPosts = true
  showingFollowingPosts = false
  showingUserPosts = false
  showPosts('posts/latest', false)
}

function showFollowingPosts() {
  showingLatestPosts = false
  showingFollowingPosts = true
  showingUserPosts = false
  console.log("showuserposts")
  showPosts('posts/following', true)
}

function showUserPosts() {
  showingLatestPosts = false
  showingFollowingPosts = false
  showingUserPosts = true
  showPosts(`users/${userFoundId}/posts`, true)
}

document.addEventListener('click', async function(event) {
  if (event.target.closest('.like-button')) {
    if (user === null) {
      console.log('User is not logged in')
      return
    }
    const button = event.target.closest('.like-button')
    const postId = button.dataset.id
    const result = await likePost(postId)
    button.innerHTML = `<span class="pe-3">${result.likes}</span><i class="fa fa-thumbs-up fa-2x" aria-hidden="true"></i>`
  }
})