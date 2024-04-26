const firebaseConfig = {
     apiKey: 'AIzaSyBkfYyTPgh_Q_bRGMZCh4FFtDEuSUH0FZ8',
     authDomain: 'fyp-authenticator.firebaseapp.com',
     databaseURL: 'https://fyp-authenticator-default-rtdb.asia-southeast1.firebasedatabase.app',
     projectId: 'fyp-authenticator',
     storageBucket: 'fyp-authenticator.appspot.com',
     messagingSenderId: '349168492324',
     appId: '1:349168492324:web:3c643efd068d12745dddb1',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const keyDivText = document.querySelector('.keyDiv h3');

var uid_get = localStorage.getItem('UID');
var email_get = localStorage.getItem('UID_email');
isLogin();
let uidUser = uid_get.replace(/"/g, '');
let uid_email = email_get.replace(/"/g, '');

checkIsKeyExist();

const swiper = new Swiper('.myswiper', {
     // Optional parameters
     slidesPerView: 1,
     direction: 'horizontal',
     loop: true,

     // If we need pagination
     pagination: {
          el: '.swiper-pagination',
          clickable: true,
     },

     // Navigation arrows
     navigation: {
          nextEl: '.swiper-next-but',
          prevEl: '.swiper-prev-but',
     },
});


function logout() {
     localStorage.clear();
     window.location.href = '../index.html';
}

function isLogin() {
     if (uid_get == '' || uid_get == null) {
          window.location.href = '../FYP_Mock.html';
     }
}

/****generate key */
function generateQRCode(text) {
     var qrCodeDiv = document.getElementById('qrCodeImg');

     // Clear previous QR code if any
     qrCodeDiv.innerHTML = '';

     // Create QR code
     var qrCode = new QRCode(qrCodeDiv, {
          text: text,
          width: 220,
          height: 220,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
     });
}


function checkIsKeyExist() {
     const dbref = firebase.database().ref();
     const thelist = dbref.child('Keys');
     var isConnected = false;

     var isExist = false;
     var existKeyData = {
          webEmail: null,
          UIDweb: null,
          connectKey: null,
          appName: 'Mocker',
          idKey: null,
     };

     thelist.once('value', function (snapshot) {
          thedata = snapshot.val();

          snapshot.forEach(function (data) {
               //data is the bundle
               thedata = data.val(); //thedata is the data of the bundle
               var thekey = data.key; //key is thee key of bundle
               var UIDweb = thedata['UIDweb']; //retrieve using parameter

               if (uidUser == UIDweb && thedata['appName'] == 'Mocker') {
                    isExist = true;
                    existKeyData = thedata;
                    isConnected = thedata['isConnected'];
               }
          });

          if (isExist) {
               var key_to_16byte = convertTo16Bytes(existKeyData.idKey);
               var byte_to_string = convertToString(key_to_16byte);
               var decryptKey = decryptData(existKeyData.connectKey, byte_to_string);
               keyDivText.textContent = decryptKey;
               generateQRCode(decryptKey);
               //checkIsConnected(existKeyData.connectKey);

               if(isConnected){
                    const titleDashboard = document.querySelector('.titleDashboard');
                    titleDashboard.textContent = 'Is Connected';
               }
          } else {
               generateKey();
          }
     });
}

function generateRandomString(length) {
     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     let result = '';
     for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
     }
     return result;
}

function generateKey() {
     var x = generateRandomString(8);
     keyDivText.textContent = x;

     const dbref = firebase.database().ref();
     const thelist = dbref.child('Keys');

     const newData = {
          webEmail: uid_email,
          UIDweb: uidUser,
          connectKey: x,
          appName: 'Mocker',
          idKey: null,
          isConnected: false,
     };

     thelist
          .push()
          .then((newChildRef) => {
               // Get the push key value
               const pushKey = newChildRef.key;
               var key_to_16byte = convertTo16Bytes(pushKey);
               var byte_to_string = convertToString(key_to_16byte);
               var encrypted_key = encryptData(x, byte_to_string);

               // Set the push key value in the new object
               newData.idKey = pushKey;
               newData.connectKey = encrypted_key;
               generateQRCode(x);

               return newChildRef.set(newData);
          })
          .catch((error) => {
               //showToast('error', 'Failed to sign up');
               console.error(error);
          });
}

/*****toast****** */
const toastUl = document.getElementById('toastUl');
const toastDetails = {
     success: {
          icon: 'uim uim-check-circle',
          text: 'Action successful',
     },
     error: {
          icon: 'uim uim-exclamation-triangle',
          text: 'Error occurred',
     },
};

function removeToast(toast) {
     toast.classList.add('hide');
     if (toast.timeoutId) clearTimeout(toast.timeoutId);
     setTimeout(() => toast.remove(), 500);
}
function showToast(whichtoast, thetext) {
     const { icon, text } = toastDetails[whichtoast];
     const toast = document.createElement('li');
     toast.className = `toast ${whichtoast}`;
     toast.innerHTML = `<div class="column">
                              <i class="${icon}"></i>
                              <h3>${thetext}</h3>
                         </div>
                         <i class="uil uil-times" onclick="removeToast(this.parentElement)"></i>`;

     toastUl.appendChild(toast);

     toast.timeoutId = setTimeout(() => removeToast(toast), 2000);
}

//encryption
function encryptData(plaintext, secret) {
     var key = CryptoJS.enc.Utf8.parse(secret);

     // Encrypt the plaintext
     var cipherText = CryptoJS.AES.encrypt(plaintext, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
     });
     return cipherText.toString();
}

function decryptData(cipherText, secret) {
     var key = CryptoJS.enc.Utf8.parse(secret);
     var cipherBytes = CryptoJS.enc.Base64.parse(cipherText);

     var decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherBytes }, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
     });

     return decrypted.toString(CryptoJS.enc.Utf8);
}

function convertTo16Bytes(input) {
     // Convert input string to UTF-8 encoded bytes
     let inputBytes = new TextEncoder().encode(input);

     // Create a new Uint8Array of length 16 filled with zeros
     let result = new Uint8Array(16);
     result.fill(0);

     // Copy up to 16 bytes from inputBytes to result
     result.set(inputBytes.slice(0, Math.min(inputBytes.length, 16)));
     return result;
}

function convertToString(byteArray) {
     // Convert Uint8Array back to string using UTF-8 decoding
     return new TextDecoder().decode(byteArray);
}

