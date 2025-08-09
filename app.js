
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
const storage = firebase.storage();

// DOM refs
const blogForm = document.getElementById('blogForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const imageInput = document.getElementById('image');
const previewEl = document.getElementById('preview');
const postsEl = document.getElementById('posts');
const postBtn = document.getElementById('postBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');

// show preview
imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) { previewEl.style.display = 'none'; previewEl.innerHTML = ''; return; }

  if (file.size > 5 * 1024 * 1024) {
    alert('Please choose an image smaller than 5MB');
    imageInput.value = '';
    previewEl.style.display = 'none';
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    previewEl.style.display = 'block';
    previewEl.innerHTML = `<img src="${e.target.result}" alt="preview">`;
  };
  reader.readAsDataURL(file);
});

// clear
clearBtn.addEventListener('click', () => {
  blogForm.reset();
  previewEl.style.display = 'none';
  previewEl.innerHTML = '';
  statusEl.textContent = '';
});

// submit
blogForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const file = imageInput.files[0] || null;

  if (!title || !content) {
    alert('Please enter a title and content');
    return;
  }

  postBtn.disabled = true;
  statusEl.textContent = 'Posting...';

  try {
    let imageUrl = '';
    if (file) {
      const fileName = `blogImages/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`;
      const storageRef = storage.ref().child(fileName);
      const snapshot = await storageRef.put(file);
      imageUrl = await snapshot.ref.getDownloadURL();
    }

    await db.ref('blogs').push({
      title,
      content,
      imageUrl: imageUrl || '',
      timestamp: Date.now()
    });

    blogForm.reset();
    previewEl.style.display = 'none';
    previewEl.innerHTML = '';
    statusEl.textContent = 'Posted ✓';
    setTimeout(() => statusEl.textContent = '', 2000);
  } catch (err) {
    console.error(err);
    alert('Error posting blog. See console for details.');
    statusEl.textContent = 'Error';
  } finally {
    postBtn.disabled = false;
  }
});

// render posts
db.ref('blogs').on('value', snapshot => {
  const data = snapshot.val();
  postsEl.innerHTML = '';

  if (!data) {
    postsEl.innerHTML = '<p style="color:#666">No posts yet. Create the first one!</p>';
    return;
  }

  const posts = Object.values(data).sort((a,b) => b.timestamp - a.timestamp);
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';

    const hasImage = post.imageUrl && post.imageUrl.length > 5;
    const thumbHtml = hasImage ? `<div class="thumb"><img src="${post.imageUrl}" alt="post image"></div>` : '';
    const contentHtml = `
      <div class="content">
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.content)}</p>
        <div class="meta">${formatTimestamp(post.timestamp)}</div>
      </div>`;

    div.innerHTML = hasImage ? thumbHtml + contentHtml : contentHtml;
    postsEl.appendChild(div);
  });
});

// utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"'`=\/]/g, function(s) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[s]);
  });
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString();
}
