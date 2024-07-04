// Importar las funciones que necesitas de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Inicializar Firebase
console.log('Inicializando Firebase');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
console.log('Firebase inicializado');

// Manejar el envío del formulario
document.getElementById('case-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Formulario enviado');

    const caseName = document.getElementById('case-name').value;
    const caseAttachment = document.getElementById('case-attachment').files[0];

    if (caseName && caseAttachment) {
        console.log('Nombre del caso:', caseName);
        console.log('Archivo adjunto:', caseAttachment.name);

        try {
            const storageRef = ref(storage, `attachments/${caseAttachment.name}`);
            await uploadBytes(storageRef, caseAttachment);
            console.log('Archivo subido a Storage');

            const attachmentUrl = await getDownloadURL(storageRef);
            console.log('URL del archivo:', attachmentUrl);

            await addDoc(collection(db, 'cases'), {
                name: caseName,
                attachmentUrl: attachmentUrl,
                createdAt: serverTimestamp()
            });
            console.log('Documento agregado a Firestore');

            document.getElementById('case-form').reset();
            alert('Caso guardado exitosamente');
            loadCases();
        } catch (error) {
            console.error('Error al agregar documento: ', error);
            alert('Error al guardar el caso: ' + error.message);
        }
    } else {
        alert('Por favor, completa todos los campos.');
    }
});

// Cargar los casos
const loadCases = async () => {
    console.log('Cargando casos');
    const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const casesList = document.getElementById('cases-list');
    casesList.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const caseData = doc.data();
        const caseElement = document.createElement('div');
        caseElement.innerHTML = `
            <h2>${caseData.name}</h2>
            <img src="${caseData.attachmentUrl}" alt="Adjunto" style="max-width: 200px;">
        `;
        casesList.appendChild(caseElement);
    });
    console.log('Casos cargados');
};

loadCases();
