// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDdY1bCaSLynhzgFcHjPxNezpVYdmeNbT8",
  authDomain: "notorio-aeec1.firebaseapp.com",
  databaseURL: "https://notorio-aeec1-default-rtdb.firebaseio.com",
  projectId: "notorio-aeec1",
  storageBucket: "notorio-aeec1.appspot.com",
  messagingSenderId: "649026423297",
  appId: "1:649026423297:web:f4cf920e3f69fe747cce00"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// DOM elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authUsername = document.getElementById('auth-username');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userUsername = document.getElementById('user-username');
const editUsernameBtn = document.getElementById('edit-username-btn');
const editUsernameModal = document.getElementById('edit-username-modal');
const newUsernameInput = document.getElementById('new-username-input');
const saveUsernameBtn = document.getElementById('save-username-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const addNoteBtn = document.getElementById('add-note-btn');
const notesList = document.getElementById('notes-list');
const noteView = document.getElementById('note-view');
const noteEdit = document.getElementById('note-edit');
const noteTitleView = document.getElementById('note-title-view');
const noteBodyView = document.getElementById('note-body-view');
const noteAttachments = document.getElementById('note-attachments');
const noteTitleInput = document.getElementById('note-title-input');
const noteBodyInput = document.getElementById('note-body-input');
const noteColorInput = document.getElementById('note-color-input');
const noteFileInput = document.getElementById('note-file-input');
const saveNoteBtn = document.getElementById('save-note-btn');
const editNoteBtn = document.getElementById('edit-note-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');

let currentUser = null;
let currentNote = null;

// Authentication
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authEmail.value;
    const password = authPassword.value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
});

signupBtn.addEventListener('click', () => {
    const email = authEmail.value;
    const password = authPassword.value;
    const username = authUsername.value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.ref('users/' + userCredential.user.uid).set({
                username: username
            });
        })
        .catch(error => alert(error.message));
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        db.ref('users/' + user.uid).once('value').then((snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.username) {
                userUsername.textContent = userData.username;
            } else {
                userUsername.textContent = user.email;
            }
        });
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        loadNotes();
    } else {
        currentUser = null;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        userInfo.classList.add('hidden');
        userUsername.textContent = '';
        notesList.innerHTML = '';
    }
});

// Username management
editUsernameBtn.addEventListener('click', () => {
    editUsernameModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    editUsernameModal.classList.add('hidden');
});

saveUsernameBtn.addEventListener('click', () => {
    const newUsername = newUsernameInput.value;
    if (newUsername) {
        db.ref('users/' + currentUser.uid).update({ username: newUsername })
            .then(() => {
                userUsername.textContent = newUsername;
                editUsernameModal.classList.add('hidden');
            })
            .catch(error => alert(error.message));
    }
});

// Note management
function loadNotes() {
    const notesRef = db.ref('users/' + currentUser.uid + '/notes');
    notesRef.on('value', (snapshot) => {
        const notes = snapshot.val();
        notesList.innerHTML = '';
        for (let id in notes) {
            const note = notes[id];
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            noteItem.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</p>
            `;
            noteItem.style.borderLeft = `5px solid ${note.color}`;
            noteItem.addEventListener('click', () => viewNote(id, note));
            notesList.appendChild(noteItem);
        }
    });
}

function viewNote(id, note) {
    currentNote = { id, ...note };
    noteTitleView.textContent = note.title;
    noteBodyView.textContent = note.content;
    noteAttachments.innerHTML = '';
    if (note.attachments) {
        for (let attachmentId in note.attachments) {
            const attachment = note.attachments[attachmentId];
            if (attachment.type === 'image') {
                const img = document.createElement('img');
                img.src = attachment.url;
                img.alt = attachment.name;
                noteAttachments.appendChild(img);
            } else if (attachment.type === 'pdf') {
                const link = document.createElement('a');
                link.href = attachment.url;
                link.textContent = attachment.name;
                link.target = '_blank';
                noteAttachments.appendChild(link);
            }
        }
    }
    noteView.classList.remove('hidden');
    noteEdit.classList.add('hidden');
}

addNoteBtn.addEventListener('click', () => {
    currentNote = null;
    noteTitleInput.value = '';
    noteBodyInput.value = '';
    noteColorInput.value = '#ffffff';
    noteFileInput.value = '';
    noteView.classList.add('hidden');
    noteEdit.classList.remove('hidden');
});

editNoteBtn.addEventListener('click', () => {
    noteTitleInput.value = currentNote.title;
    noteBodyInput.value = currentNote.content;
    noteColorInput.value = currentNote.color;
    noteFileInput.value = '';
    noteView.classList.add('hidden');
    noteEdit.classList.remove('hidden');
});

saveNoteBtn.addEventListener('click', () => {
    const title = noteTitleInput.value;
    const content = noteBodyInput.value;
    const color = noteColorInput.value;
    const files = noteFileInput.files;
    
    if (title && content) {
        const noteData = { title, content, color };
        let noteRef;
        if (currentNote) {
            noteRef = db.ref('users/' + currentUser.uid + '/notes/' + currentNote.id);
            noteRef.update(noteData);
        } else {
            noteRef = db.ref('users/' + currentUser.uid + '/notes').push();
            noteRef.set(noteData);
        }

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileRef = storage.ref('users/' + currentUser.uid + '/notes/' + noteRef.key + '/' + file.name);
                fileRef.put(file).then((snapshot) => {
                    return snapshot.ref.getDownloadURL();
                }).then((url) => {
                    const attachmentData = {
                        name: file.name,
                        type: file.type.startsWith('image/') ? 'image' : 'pdf',
                        url: url
                    };
                    noteRef.child('attachments').push(attachmentData);
                });
            }
        }

        noteView.classList.add('hidden');
        noteEdit.classList.add('hidden');
    }
});

deleteNoteBtn.addEventListener('click', () => {
    if (currentNote) {
        if (currentNote.attachments) {
            for (let attachmentId in currentNote.attachments) {
                const attachment = currentNote.attachments[attachmentId];
                storage.refFromURL(attachment.url).delete();
            }
        }
        db.ref('users/' + currentUser.uid + '/notes/' + currentNote.id).remove();
        noteView.classList.add('hidden');
        currentNote = null;
    }
});