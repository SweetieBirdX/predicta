# Firebase Kurulum Rehberi

## 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Create a project" veya "Add project" butonuna tıklayın
3. Proje adını girin (örn: "predicta-demo")
4. Google Analytics'i istiyorsanız aktif edin (isteğe bağlı)
5. "Create project" butonuna tıklayın

## 2. Firestore Database Kurulumu

1. Firebase Console'da sol menüden "Firestore Database" seçin
2. "Create database" butonuna tıklayın
3. "Start in test mode" seçin (geliştirme için)
4. Location seçin (Europe-west3 önerilir)
5. "Done" butonuna tıklayın

## 3. Web App Ekleme

1. Firebase Console'da proje ayarlarına gidin (⚙️ ikonu)
2. "General" sekmesinde "Your apps" bölümünde "</>" web simgesine tıklayın
3. App nickname girin (örn: "predicta-web")
4. "Register app" butonuna tıklayın
5. Firebase SDK configuration kodunu kopyalayın

## 4. Environment Variables Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Firebase SDK configuration'dan aldığınız değerleri buraya yerleştirin.

## 5. Firestore Security Rules (İsteğe bağlı)

Development için test modunda başlatabilirsiniz, ancak production için security rules ayarlamanız gerekecek:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar kendi verilerini okuyabilir/yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tahminler herkesçe okunabilir, sadece giriş yapanlar oluşturabilir
    match /predictions/{predictionId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.creatorId == request.auth.uid;
    }
    
    // Oylar sadece kendi oyunu gören kullanıcı tarafından okunabilir
    match /votes/{voteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 6. Çalıştırma

Environment variables ayarlandıktan sonra:

```bash
npm run dev
```

Uygulamanız http://localhost:3000 adresinde çalışacak. 