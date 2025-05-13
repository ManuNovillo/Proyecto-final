import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { getUser } from './services.js'

console.log('Hello World!');

const supabaseUrl = 'https://mwxwlheqcworkzgnkgwj.supabase.co'
const supabaseToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHdsaGVxY3dvcmt6Z25rZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDY2MjAsImV4cCI6MjA2MjAyMjYyMH0.jyWmJI1qxa4MAl5JSh_Bb7fNjEAHwrwdjSC_8hRkoyo'

const supabase = createClient(supabaseUrl, supabaseToken)

const profilePictureInput = document.querySelector('input[type=file]');
profilePictureInput.addEventListener('change', changeFile);

let user = null;

let page = 1;
let loading = false;
const loader = document.getElementById('loader');


supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    user = session.user;
  } else if (event === 'SIGNED_OUT') {
    user = null;
  }
});



const signUpForm = document.getElementById('form-signup');
signUpForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const email = document.getElementById('email-signup').value;
  const password = document.getElementById('password-signup').value;
  const confirmPassword = document.getElementById('confirm-password-signup').value;
  const errorText = document.getElementById('signup-error');
  if (password.length < 8) {
    errorText.textContent = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }
  if (password !== confirmPassword) {
    errorMessage.textContent = 'Las contraseñas no coinciden';
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    "email": email,
    "password": password,
  });

  if (data.user) {
    let myModal = new bootstrap.Modal(document.getElementById('modal-signup'))
    myModal.hide()
    updateUIForLoggedInUser();
    let user = createUser(data.user)
  } else {
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
    getUser(data.user.id).then(userFetched => {
      user = userFetched;
    }).catch(error => {
      console.error('Error fetching user:', error);
    });
    modalLogin.hide()
    updateUIForLoggedInUser();
  } else {
    errorText.textContent = 'Error al iniciar sesión';
    console.error('Error logging in:', error);
  }
});

function updateUIForLoggedInUser() {
  if (user === null) {
    console.log('User is null');
    return;
  }
  const loginButton = document.getElementById('login-button');
  const profilePictureDiv = document.getElementById('profile-picture-div');
  const profileTitle = document.getElementById('profile-title');
  const profilePicture = document.querySelectorAll('.profile-picture');

  loginButton.style.display = 'none';
  profilePictureDiv.style.display = 'block';
  profileTitle.textContent = `${user.nickname}`;
  profilePicture.forEach(picture => {
    console.log('User profile picture:', user.profile_picture);
    if (user.profile_picture !== null && user.profile_picture !== undefined)
      picture.src = user.profile_picture;
    else
      picture.src = 'https://mwxwlheqcworkzgnkgwj.supabase.co/storage/v1/object/public/profilepictures//default-profile-picture.png';
  });
}


async function changeFile() {
  console.log('File changed!');
  const file = profilePictureInput.files[0];
  const uuid = uuidv4();
  const { data, error } = supabase.storage.from('posts').upload(`${uuid}`, file)
  if (data) {
    console.log('File uploaded successfully:', data);
  }
}

async function getSessionToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}


function handleScroll() {
  return;
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (loading) return;
    loading = true;
    const postContainer = document.getElementById('posts');
    try {
      posts = loadPosts('posts/latest', page);
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
                            ${post.user.nickname}
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

window.addEventListener('scroll', handleScroll);
