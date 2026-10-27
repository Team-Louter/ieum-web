const form = document.querySelector('form');
const idInput = document.querySelector('input[type="text"]');
const pwInput = document.querySelector('input[type="password"]');
const errorMsg = document.querySelector('.error-msg');

errorMsg.style.display = 'none';

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = idInput.value.trim();
  const pw = pwInput.value.trim();

  if (id === '' || pw === '') {
    errorMsg.style.display = 'block';
    return;
  }

  // 임시 아이디/비번 ㅜㅜ(추후 수정할 예정.. 지금은 로그인 되는지 확인하려고..)
  const isValid = (id === 'test' && pw === '1234');

  if (!isValid) {
    errorMsg.style.display = 'block';
  } else {
    errorMsg.style.display = 'none';

    // location.href = 'main.html'; // 메인페이지 만들어지면 연결
  }
});
