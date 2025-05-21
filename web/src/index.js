import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { getUser, createUser, updateUser, createPost, getUserByName } from './services.js'

const supabaseUrl = 'https://mwxwlheqcworkzgnkgwj.supabase.co'
const supabaseToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHdsaGVxY3dvcmt6Z25rZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDY2MjAsImV4cCI6MjA2MjAyMjYyMH0.jyWmJI1qxa4MAl5JSh_Bb7fNjEAHwrwdjSC_8hRkoyo'

export const supabase = createClient(supabaseUrl, supabaseToken)

const defaultUserPicture = 'https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures//default-profile-picture.png'

let user = null;

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in auth state:', session);
    user = await getUser(session.user.id);
    console.log('User:', user);
  } else if (event === 'SIGNED_OUT') {
    user = null;
  }
});

if (localStorage.getItem('sb-mwxwlheqcworkzgnkgwj-auth-token') !== null) {
  const token = JSON.parse(localStorage.getItem('sb-mwxwlheqcworkzgnkgwj-auth-token'));
  console.log('Token:', token.user);
  user = await getUser(token.user.id);
  updateUIForLoggedInUser();
  console.log('User:', user);
} else {
  console.log('No session found in local storage');
}

let page = 1;
let loading = false;
const loader = document.getElementById('loader');

var fileInput = document.getElementById('upload');
//var filename = fileInput.files[0].name;

const searchUserForm = document.getElementById('form-search-user');
searchUserForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const searchInput = document.getElementById('search-user-input').value;
  const errorText = document.getElementById('search-user-error');
  if (searchInput.length == 0) {
    errorText.textContent = 'Introduce un nombre de usuario';
    return;
  }
  try {
    const userFound = await getUserByName(searchInput);
    errorText.textContent = '';
    console.log('User found:', userFound);
    const userContainer = document.getElementById('user-data');
    userContainer.style.display = 'block';
    postCreateForm.style.display = 'none';
    const img = userContainer.querySelector("img")
    img.src = userFound.profile_picture ? userFound.profile_picture : defaultUserPicture;
    const userFoundName = userContainer.querySelector('h3');
    userFoundName.textContent = userFound.nickname;
    const userFoundDescription = userContainer.querySelector('p');
    userFoundDescription.textContent = userFound.description ? userFound.description : '';
  } catch (exception) {
    errorText.textContent = 'Error al buscar el usuario';
    console.error('Error searching user:', exception);
  }
});

const signUpForm = document.getElementById('form-signup');
signUpForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const email = document.getElementById('email-signup').value;
  const password = document.getElementById('password-signup').value;
  const nickname = document.getElementById('nickname').value;
  const confirmPassword = document.getElementById('confirm-password-signup').value;
  const errorText = document.getElementById('signup-error');
  if (password.length < 8) {
    errorText.textContent = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }
  if (password !== confirmPassword) {
    errorText.textContent = 'Las contraseñas no coinciden';
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    "email": email,
    "password": password,
  });

  if (data.user) {
    console.log('User signed up:', data.user);
    console.log('User id:', data.user.id);
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
      console.log('User created:', user);
      updateUIForLoggedInUser();
    } catch (exception) {
      console.error('Error creating user:', exception);
      errorText.textContent = 'Error al crear el usuario';
    }
  } else {
    console.error('Error creating user:', error);
    errorText.textContent = 'Error al crear el usuario';
  }
});

const loginForm = document.getElementById('form-login');
loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const email = document.getElementById('email-login').value;
  const password = document.getElementById('password-login').value;
  const errorText = document.getElementById('login-error');
  const { data, error } = await supabase.auth.signInWithPassword({
    "email": email,
    "password": password,
  });

  if (data.user) {
    console.log('User logged in:', data);
    let modalLogin = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-login'))
    try {
      user = await getUser(data.user.id);
      modalLogin.hide()
      updateUIForLoggedInUser();
      console.log('User data:', user);
    } catch (exception) {
      errorText.textContent = 'Error al iniciar sesión';
      console.error('Error logging in:', error);
    }
  } else {
    errorText.textContent = 'Error al iniciar sesión';
    console.error('Error logging in:', error);
  }
});

window.addEventListener('scroll', handleScroll);

const profileForm = document.getElementById('form-profile');
profileForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const file = document.getElementById('profile-picture-input').files[0];
  let fileUrl;
  if (file) {
    const user_id = user.supabase_id;
    const { data, error } = supabase.storage.from('profilepictures').upload(`${user_id}`, file, {
      upsert: true
    });
    if (data) {
      console.log('File uploaded successfully:', data);
      fileUrl = `https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures/${data.path}`;
    }
    else if (error) {
      console.error('Error uploading file:', error);
    }
  }
  const description = document.getElementById('profile-description').value;
  try {
    console.log('Updating user:', user);
    user = await updateUser({
      "id": user.id,
      "description": description,
      "profile_picture": fileUrl,
    });
    updateUIForLoggedInUser();
  } catch (exception) {
    console.error('Error updating user:', exception);
  }
});


const postCreateForm = document.getElementById('post-create-form');
postCreateForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const text = document.getElementById('post-text').value;
  const file = document.getElementById('post-file-input').files[0];
  const errorText = document.getElementById('post-error');
  let fileUrl = null;
  if (file) {
    const uuid = uuidv4();
    const { data, error } = await supabase.storage.from('posts').upload(`${uuid}`, file);
    console.log("Full path", data.fullPath);
    console.log("File name", data.name);
    console.log("File type", data.type);
    if (data) {
      console.log('File uploaded successfully:', data);
      console.log('Post created successfully');
      postCreateForm.reset();
      fileUrl = `https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/posts//${data.path}`;
    } else {
      errorText.textContent = 'Error al subir el archivo';
      console.error('Error uploading file:', error);
    }
  }
  const fileType = file?.type.includes('image') ? 'image' : file?.type.includes('video') ? 'video' : 'none';
  console.log('User:', user);
  console.log('User id:', user.id);
  createPost({
    "user": user.id,
    "text": text,
    "file": fileUrl,
    "file_type": fileType
  }).then(() => {
    console.log('Post created successfully');
    postCreateForm.reset();
  }).catch((error) => {
    console.error('Error creating post:', error);
  })
});

function updateUIForLoggedInUser() {
  const loginButton = document.getElementById('login-button');
  const profilePictureDiv = document.getElementById('profile-picture-div');
  const profileTitle = document.getElementById('profile-title');
  const profilePicture = document.querySelectorAll('.profile-picture');

  loginButton.style.display = 'none';
  profilePictureDiv.style.display = 'block';
  profileTitle.textContent = `${user.nickname}`;
  profilePicture.forEach(picture => {
    if (user.profile_picture)
      picture.src = user.profile_picture;
    else
      picture.src = defaultUserPicture;
  });
}

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (loading) return;
    loading = true;
    const postContainer = document.getElementById('posts');
    try {
      /*       const posts = loadPosts('posts/latest', page); */
      const posts = []
      loader.style.display = 'block';
      if (posts.length === 0) {
        return;
      }

      posts.forEach(post => {
        postContainer.innerHTML += `
        <div class="card mx-auto mb-3 text-bg-dark border-subtle">
                <div class="card-body">
                    <div class="row">
                        <div class="col-6">
                            <a href=''>${post.user.nickname}</a>
                        </div>
                        <div class="col-6 text-end">
                            <p>${post.date_uploaded}</p>
                        </div>
                    </div> ` +
          post.file_type === 'image' ?
          `<img class="card-img-top"
                        src="${post.file}"
                        alt="Post image" />`

          : post.file_type === 'video' ?
            `video class="card-img-top"
                        src="${post.file}" />`
            : ''
            +
            `<p class="card-text">${post.text}</p>
                </div>
            </div>
      `
      });
    } catch (error) {
      postContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            Error loading posts
        </div>
      `;
    }
  }
}