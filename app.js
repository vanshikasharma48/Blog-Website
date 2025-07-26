
const firebaseConfig = {
  apiKey: "AIzaSyB8k0lwRyzfVBPgTw0t-VwpYIFPJDVJsuA",
  authDomain: "blog-website-15736.firebaseapp.com",
  projectId: "blog-website-15736",
  storageBucket: "blog-website-15736.appspot.com",
  messagingSenderId: "249409297286",
  appId: "1:249409297286:web:e2ba9db797ae0da837ea07",
  measurementId: "G-6VMLYJ10YJ",
  databaseURL: "https://blog-website-15736-default-rtdb.asia-southeast1.firebasedatabase.app/"
};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();


document.getElementById('blogForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  db.ref('blogs').push({
    title,
    content,
    timestamp: Date.now()
  });

  document.getElementById('blogForm').reset();
});


db.ref('blogs').on('value', snapshot => {
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';
  const data = snapshot.val();

  if (data) {
    const posts = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
    posts.forEach(post => {
      const div = document.createElement('div');
      div.classList.add('post');
      div.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p>`;
      postsContainer.appendChild(div);
    });
  }
});
