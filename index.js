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

const APPNAME_SEED = 'Mocker';

const emailInput_login = document.getElementById('emailInput');
const pwdInput_login = document.getElementById('pwdInput');
const emailInput = document.getElementById('emailInput_signup');
const phoneInput = document.getElementById('phoneInput_signup');
const pwdInput = document.getElementById('pwdInput_signup');
const msgInput_email = document.getElementById('msgInput_email');
const msgInput_phone = document.getElementById('msgInput_phone');
const msgInput_pwd = document.getElementById('msgInput_pwd');
const msgInput_otp = document.getElementById('msgInput_otp');

const logincontainer = document.querySelector('.logincontainer');
const otpContainer = document.querySelector('.otpContainer');
const otpInput = document.getElementById('otpInput');

var UIDWEBUSER = null;
var UIDWEBEMAIL = null;

function showRegisterBox() {
     if (logincontainer.style.display == 'flex') {
          logincontainer.style.display = 'none';
     } else {
          logincontainer.style.display = 'flex';
     }
}

function login() {
     var email = emailInput_login.value.trim().toLowerCase();
     var pwd = pwdInput_login.value;

     var isAnyFieldEmpty = email === '' || pwd === '';

     if (isAnyFieldEmpty) {
          showToast('error', 'Sorry, we could not find your account.');
     } else {
          authenticate(email, pwd);
     }
}

function authenticate(email_enter, pwd_enter) {
     const dbref = firebase.database().ref();
     const thelist = dbref.child('UsersWeb');
     var isLogin = false;
     var bcrypt = dcodeIO.bcrypt;

     thelist.once('value', function (snapshot) {
          thedata = snapshot.val();
          var id = snapshot.key;

          snapshot.forEach(function (data) {
               //data is the bundle
               thedata = data.val(); //thedata is the data of the bundle
               var thekey = data.key; //key is thee key of bundle
               var emailGet = thedata['email']; //retrieve using parameter
               var passwordGet = thedata['pwd'];

               if (email_enter == emailGet && bcrypt.compareSync(pwd_enter, passwordGet)) {
                    isLogin = true;
                    UIDWEBUSER = thekey.toString();
                    UIDWEBEMAIL = emailGet;
                    checkIsConnected(thekey);
                    return;
               }
          });

          if (!isLogin) {
               showToast('error', 'Sorry, we could not find your account.');
          }
     });
}

function checkIsConnected(uidUser) {
     const dbref = firebase.database().ref();
     const thelist = dbref.child('Keys');
     var isActivated = false;

     thelist.once('value', function (snapshot) {
          thedata = snapshot.val();

          snapshot.forEach(function (data) {
               //data is the bundle
               thedata = data.val(); //thedata is the data of the bundle

               var isConnected = thedata['isConnected']; //retrieve using parameter

               if (
                    uidUser == thedata['UIDweb'] &&
                    thedata['appName'] == APPNAME_SEED &&
                    isConnected == true
               ) {
                    isActivated = true;
               }
          });

          if (isActivated) {
               otpContainer.style.display = 'flex';
          } else {
               showToast('success', 'Login successful');
               localStorage.setItem('UID', JSON.stringify(UIDWEBUSER));
               localStorage.setItem('UID_email', JSON.stringify(UIDWEBEMAIL));
               window.location.href = 'Dashboard/Dashboard.html';
          }
     });
}

function validateEmail(email) {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

     if (!emailRegex.test(email)) {
          msgInput_email.style.display = 'flex';
          return false;
     } else {
          msgInput_email.style.display = 'none';
     }
     return true;
}

function validatePhoneNumber(phone) {
     const phoneRegex = /^601\d{8,9}$/; // Matches a string starting with "60" followed by 8or9 digits

     if (!phoneRegex.test(phone)) {
          msgInput_phone.style.display = 'flex';
          return false;
     } else {
          msgInput_phone.style.display = 'none';
     }
     return true;
}

function validatePassword(password) {
     // Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character
     //const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
     const passwordRegex = /^.{6,}$/; // at least 6 char

     if (!passwordRegex.test(password)) {
          msgInput_pwd.style.display = 'flex';
          return false;
     } else {
          msgInput_pwd.style.display = 'none';
     }
     return true;
}


function register() {
     var email = emailInput.value.trim().toLowerCase();
     var phone = phoneInput.value.trim();
     var pwd = pwdInput.value;

     var isEmailValid = validateEmail(email);
     var isPhoneValid = validatePhoneNumber(phone);
     var isPasswordValid = validatePassword(pwd);

     var isAnyFieldEmpty = email === '' || phone === '' || pwd === '';

     if (isAnyFieldEmpty) {
          showToast('error', 'Failed to sign up');
     } else if (!isEmailValid || !isPhoneValid || !isPasswordValid) {
          showToast('error', 'Failed to sign up');
     } else {
          checkEmail(email, phone, pwd);
     }
}

function uploadRegister(EMAIL, PHONE, PWD) {
     const dbref = firebase.database().ref();
     const thelist = dbref.child('UsersWeb');

     var bcrypt = dcodeIO.bcrypt;
     var salt = bcrypt.genSaltSync(11);
     var hashOutput = bcrypt.hashSync(PWD, salt);

     //var encryptedPwd = encryptPwd(PWD);

     const newData = {
          email: EMAIL,
          phone: PHONE,
          pwd: hashOutput,
          idkey: null,
     };

     thelist
          .push()
          .then((newChildRef) => {
               // Get the push key value
               const pushKey = newChildRef.key;

               // Set the push key value in the new object
               newData.idkey = pushKey;
               showToast('success', 'Sign up successfully');
               emailInput.value = '';
               phoneInput.value = '';
               pwdInput.value = '';
               showRegisterBox();

               // Update the new child with the new object
               return newChildRef.set(newData);
          })
          .catch((error) => {
               showToast('error', 'Failed to sign up');
               console.error(error);
          });
}

function checkEmail(email_enter, PHONE, PWD) {
     const dbref = firebase.database().ref();
     const thelist = dbref.child('UsersWeb');

     var isExist = false;

     thelist.once('value', function (snapshot) {
          thedata = snapshot.val();

          snapshot.forEach(function (data) {
               //data is the bundle
               thedata = data.val(); //thedata is the data of the bundle
               //var thekey = data.key; //key is thee key of bundle
               var emailGet = thedata['email']; //retrieve using parameter

               if (email_enter == emailGet) {
                    isExist = true;
               }
          });

          if (isExist) {
               showToast('error', 'This user is existed');
          } else {
               uploadRegister(email_enter, PHONE, PWD);
          }
     });
}

/*****totp ***/

function generateTOTP(secretKey, i, SHA_ALGO) {
     const timeStep = 30; // Time step in seconds
     const digits = 6; // Number of digits in the generated code

     const hmacSHA1 = (key, data) => {
          const hmacKey = window.atob(key);
          const dataBytes = new Uint8Array(data);

          const hmacKeyBytes = new Uint8Array(hmacKey.length);
          for (let i = 0; i < hmacKey.length; i++) {
               hmacKeyBytes[i] = hmacKey.charCodeAt(i);
          }

          const shaObj = new window.jsSHA(SHA_ALGO, 'ARRAYBUFFER');
          //const shaObj = new window.jsSHA('SHA-1', 'ARRAYBUFFER');

          shaObj.setHMACKey(hmacKeyBytes, 'ARRAYBUFFER');
          shaObj.update(dataBytes);
          const hmacBytes = shaObj.getHMAC('ARRAYBUFFER');
          return new Uint8Array(hmacBytes);
     };

     const counter = Math.floor(Date.now() / (timeStep * 1000));

     const counterBuffer = new ArrayBuffer(8);
     const counterDataView = new DataView(counterBuffer);
     counterDataView.setBigUint64(0, BigInt(counter - i));

     const hash = hmacSHA1(secretKey, counterBuffer);

     const offset = hash[hash.length - 1] & 0xf;
     const binary =
          ((hash[offset] & 0x7f) << 24) |
          ((hash[offset + 1] & 0xff) << 16) |
          ((hash[offset + 2] & 0xff) << 8) |
          (hash[offset + 3] & 0xff);

     const otp = binary % Math.pow(10, digits);
     return otp.toString().padStart(digits, '0');
}

function generateHOTP(secretKey, counter, SHA_ALGO) {
     const digits = 6; // Number of digits in the generated code

     const hmacSHA1 = (key, data) => {
          const hmacKey = window.atob(key);
          const dataBytes = new Uint8Array(data);

          const hmacKeyBytes = new Uint8Array(hmacKey.length);
          for (let i = 0; i < hmacKey.length; i++) {
               hmacKeyBytes[i] = hmacKey.charCodeAt(i);
          }

          const shaObj = new window.jsSHA(SHA_ALGO, 'ARRAYBUFFER');
          shaObj.setHMACKey(hmacKeyBytes, 'ARRAYBUFFER');
          shaObj.update(dataBytes);
          const hmacBytes = shaObj.getHMAC('ARRAYBUFFER');
          return new Uint8Array(hmacBytes);
     };

     const counterBuffer = new ArrayBuffer(8);
     const counterDataView = new DataView(counterBuffer);
     counterDataView.setBigUint64(0, BigInt(counter));

     const hash = hmacSHA1(secretKey, counterBuffer);

     const offset = hash[hash.length - 1] & 0xf;
     const binary =
          ((hash[offset] & 0x7f) << 24) |
          ((hash[offset + 1] & 0xff) << 16) |
          ((hash[offset + 2] & 0xff) << 8) |
          (hash[offset + 3] & 0xff);

     const otp = binary % Math.pow(10, digits);
     return otp.toString().padStart(digits, '0');
}


function hashdata(password) {
     var bcrypt = dcodeIO.bcrypt;
     var saltRound = 11;

     var salt = bcrypt.genSaltSync(saltRound);
     var hash = bcrypt.hashSync(password, salt);

     return hash;
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

function submitOTP() {
     var isValid = false;

     const dbref = firebase.database().ref();
     const thelist = dbref.child('Keys');
     const theConnectlist = dbref.child('Connects');

     thelist.once('value', function (snapshot) {
          thedata = snapshot.val();

          snapshot.forEach(function (data) {
               //data is the bundle
               thedata = data.val(); //thedata is the data of the bundle
               var thekey = data.key; //key is thee key of bundle
               var UIDweb = thedata['UIDweb']; //retrieve using parameter
               var OTP_get = thedata['OTP'];
               var connectKey = thedata['connectKey'];
               var isConnected = thedata['isConnected'];
               var SHA_ALGO = thedata['SHAalgo']; //retrieve using parameter
               var counter = thedata['counter'];
               var OTP_type = thedata['type'];

               if (
                    UIDWEBUSER == UIDweb &&
                    thedata['appName'] == APPNAME_SEED &&
                    isConnected == true
               ) {
                    var key_to_16byte = convertTo16Bytes(thekey);
                    var byte_to_string = convertToString(key_to_16byte);
                    var decrypted_connectKey = decryptData(connectKey, byte_to_string);
                    const encodedString = btoa(decrypted_connectKey);
                    let otpList = [];

                    if (OTP_type == 'TOTP') {
                         for (var i = -1; i <= 1; i++) {
                              var expectedTOTP = generateTOTP(encodedString, i, SHA_ALGO);
                              otpList.push(expectedTOTP);
                         }

                         for (let i = 0; i < otpList.length; i++) {
                              if (otpInput.value.trim() == otpList[i] && otpList[i] == OTP_get) {
                                   isValid = true;
                              }
                         }

                         if (isValid) {
                              uploadLog(expectedTOTP, thekey, thedata['appName']);
                              showToast('success', 'Login successful');
                              localStorage.setItem('UID', JSON.stringify(UIDWEBUSER));
                              localStorage.setItem('UID_email', JSON.stringify(UIDWEBEMAIL));
                              window.location.href = 'Dashboard/dashboard.html';
                         } else {
                              msgInput_otp.style.display = 'flex';
                         }
                    } else {
                         var expectedHOTP = generateHOTP(encodedString, counter, SHA_ALGO);

                         if (otpInput.value.trim() == expectedHOTP && expectedHOTP == OTP_get) {
                              isValid = true;
                         }

                         if (isValid) {
                              var updateCounter = counter + 1;
                              thelist.child(thekey).child('counter').set(updateCounter); //update Keys counter

                              //update Connects counter
                              theConnectlist.once('value', function (snapshot_inner) {
                                   thedata_inner = snapshot_inner.val();

                                   snapshot_inner.forEach(function (data_inner) {
                                        thedata_inner_inner = data_inner.val(); //thedata is the data of the bundle
                                        var thekey_inner_inner = data_inner.key; //key is thee key of bundle

                                        data_inner.forEach(function (snapdata_inner_inner) {
                                             thesnapdata = snapdata_inner_inner.val(); //thedata is the data of the bundle
                                             var thekey_snap = snapdata_inner_inner.key; //key is thee key of bundle
                                             var UIDweb_snap = thesnapdata['UIDweb'];
                                             var userID_snap = thesnapdata['userID'];

                                             if (UIDweb_snap == UIDWEBUSER) {
                                                  theConnectlist
                                                       .child(userID_snap)
                                                       .child(thekey_snap)
                                                       .child('counter')
                                                       .set(updateCounter);
                                                  uploadLog(
                                                       expectedHOTP,
                                                       thekey,
                                                       thedata['appName']
                                                  );
                                                  showToast('success', 'Login successful');
                                                  localStorage.setItem(
                                                       'UID',
                                                       JSON.stringify(UIDWEBUSER)
                                                  );

                                                  localStorage.setItem(
                                                       'UID_email',
                                                       JSON.stringify(UIDWEBEMAIL)
                                                  );
                                                  window.location.href = 'Dashboard/dashboard.html';
                                             }
                                        });
                                   });
                              });
                         } else {
                              msgInput_otp.style.display = 'flex';
                         }
                    }
               }
          });
     });
}

function uploadLog(OTP, KEY, APPNAME) {
     const dbref = firebase.database().ref();
     const thelist = dbref.child('Logs').child(KEY);

     const newData = {
          OTP: OTP,
          idKey: KEY,
          timestamp: Date.now(),
          idLog: null,
          appName: APPNAME,
     };

     thelist
          .push()
          .then((newChildRef) => {
               // Get the push key value
               const pushKey = newChildRef.key;

               // Set the push key value in the new object
               newData.logId = pushKey;

               // Update the new child with the new object
               return newChildRef.set(newData);
          })
          .catch((error) => {
               showToast('error', 'Failed to sign up');
               console.error(error);
          });
}

function encryptData(plaintext, secret) {
     var key = CryptoJS.enc.Utf8.parse(secret);

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
