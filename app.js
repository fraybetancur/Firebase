// Importar las funciones que necesitas de los SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDUaitzhPjCFymRKZdG6cCf6kcCIYAMviw",
    authDomain: "datmetrics-673c2.firebaseapp.com",
    projectId: "datmetrics-673c2",
    storageBucket: "datmetrics-673c2.appspot.com",
    messagingSenderId: "748892277936",
    appId: "1:748892277936:web:171d0bfe196f9275493f75",
    measurementId: "G-C1Q573J9T0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Manejar el envío del formulario
document.getElementById('case-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const caseName = document.getElementById('case-name').value;
    const caseAttachment = document.getElementById('case-attachment').files[0];

    if (caseName && caseAttachment) {
        const storageRef = ref(storage, `attachments/${caseAttachment.name}`);
        await uploadBytes(storageRef, caseAttachment);
        const attachmentUrl = await getDownloadURL(storageRef);

        try {
            await addDoc(collection(db, 'cases'), {
                name: caseName,
                attachmentUrl: attachmentUrl,
                createdAt: serverTimestamp()
            });
            document.getElementById('case-form').reset();
            loadCases();
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    }
});

// Cargar los casos
const loadCases = async () => {
    const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const casesList = document.getElementById('cases-list');
    casesList.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const caseData = doc.data();
        const caseElement = document.createElement('div');
        caseElement.innerHTML = `
            <h2>${caseData.name}</h2>
            <a href="${caseData.attachmentUrl}" target="_blank">Ver adjunto</a>
        `;
        casesList.appendChild(caseElement);
    });
};

loadCases();
