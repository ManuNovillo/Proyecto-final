import { createClient } from '@supabase/supabase-js'

console.log('Hello World!');

const supabaseUrl = 'https://mwxwlheqcworkzgnkgwj.supabase.co'
const supabaseToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eHdsaGVxY3dvcmt6Z25rZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDY2MjAsImV4cCI6MjA2MjAyMjYyMH0.jyWmJI1qxa4MAl5JSh_Bb7fNjEAHwrwdjSC_8hRkoyo'

const supabase = createClient(supabaseUrl, supabaseToken)

const profilePictureInput = document.querySelector('input[type=file]');
profilePictureInput.addEventListener('change', changeFile);

const signUpForm = document.getElementById('form-signup');
signUpForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const email = document.getElementById('email-signup').value;
  const password = document.getElementById('password-signup').value;
  const confirmPassword = document.getElementById('confirm-password-signup').value;
  const errorMessage = document.getElementById('password-signup-error');
  if (password.length < 8) {
    errorMessage.textContent = 'La contraseña debe tener al menos 8 caracteres';
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

  if (error) {
    alert('Error: ' + error.message);
    console.error('Error:', error.message);
  } else {
    console.log('Success:', data);
  }
});

const loginForm = document.getElementById('form-login');
loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const email = document.getElementById('email-login').value;
  const password = document.getElementById('password-login').value;
  if (password.length < 8) {
    const errorMessage = document.getElementById('password-login-error');
    errorMessage.textContent = 'La contraseña debe tener al menos 8 caracteres';
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    "email": email,
    "password": password,
  });

  if (error) {
    alert('Error: ' + error.message);
    console.error('Error:', error.message);
  } else {
    console.log('Success:', data);
  }
});

async function changeFile() {
  console.log('File changed!');
  const file = profilePictureInput.files[0];
  const { data, error } = await supabase.auth.signUp({ "email": "hdflulkahdajkdhaakdjghakdgah@gmail.com", "password": "holaquetal1234" })
  if (error) {
    console.error('Error:', error.message);
  }
  if (data.user) {
    console.log('Success:', data);
  }
}

