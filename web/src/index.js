import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

console.log('Hello World!');

const supabaseUrl = 'https://mwxwlheqcworkzgnkgwj.supabase.co'
const supabaseToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHdsaGVxY3dvcmt6Z25rZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDY2MjAsImV4cCI6MjA2MjAyMjYyMH0.jyWmJI1qxa4MAl5JSh_Bb7fNjEAHwrwdjSC_8hRkoyo'

const supabase = createClient(supabaseUrl, supabaseToken)

const profilePictureInput = document.querySelector('input[type=file]');
profilePictureInput.addEventListener('change', changeFile);

let user = null;

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

  if (data) {
    
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

  if (error) {
    errorText.textContent = "Error al iniciar sesión";
    console.error('Error:', error.message);
  } else {
    console.log('Success:', data);
    access_token = data.session.access_token;
    console.log('aaaaaaaaa');
  }
});

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

async function createUser() {

}