import React from 'react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

export default function ExamplePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <span className="text-white text-3xl font-bold">⚡</span>
          </div>
          <h1 className="text-5xl font-bold text-gradient-hero mb-4">Component Showcase</h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Modern UI component örnekleri ve etkileşimli demo alanı
          </p>
        </div>
        
        {/* Card Examples */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gradient-secondary mb-8 text-center">Kart Örnekleri</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card variant="glass" className="animate-slide-up [animation-delay:0.2s]">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">🎯</span>
                </div>
                <CardTitle>Tahmin Piyasası</CardTitle>
                <CardDescription>
                  Merkeziyetsiz tahmin piyasaları oluşturun ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 leading-relaxed">
                  Gelecekteki herhangi bir olay için piyasalar oluşturun ve kullanıcıların sonuçlar üzerinde işlem yapmasına izin verin.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    🚀 Popüler
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                    ✅ Güvenli
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="gradient" className="w-full">Daha Fazla Öğren</Button>
              </CardFooter>
            </Card>

            <Card variant="glass" className="animate-slide-up [animation-delay:0.4s]">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">📊</span>
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Piyasa performansını ve trendleri takip edin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 leading-relaxed">
                  Tüm tahmin piyasalarınız için kapsamlı analitik ve gerçek zamanlı veriler.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Aktif Piyasalar</span>
                    <span className="text-green-400 font-semibold">42</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Toplam Hacim</span>
                    <span className="text-blue-400 font-semibold">$2.4M</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="success" className="w-full">Dashboard'ı Görüntüle</Button>
              </CardFooter>
            </Card>

            <Card variant="glass" className="animate-slide-up [animation-delay:0.6s]">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-xl font-bold">💼</span>
                </div>
                <CardTitle>Portfolio Manager</CardTitle>
                <CardDescription>
                  Pozisyonlarınızı ve kazançlarınızı yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 leading-relaxed">
                  Farklı piyasalardaki tüm pozisyonlarınızı takip edin ve portföyünüzü optimize edin.
                </p>
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full" style={{width: '68%'}}></div>
                  </div>
                  <p className="text-xs text-white/60 mt-1">Portföy Performansı: +68%</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="warning" className="w-full">Portföy</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Button Examples */}
        <div className="mb-16 animate-slide-up">
          <h2 className="text-3xl font-bold text-gradient-warning mb-8 text-center">Buton Örnekleri</h2>
          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Gradient Butonlar</h3>
                <Button variant="gradient" size="sm" className="w-full">Küçük Gradient</Button>
                <Button variant="gradient" size="md" className="w-full">Orta Gradient</Button>
                <Button variant="gradient" size="lg" className="w-full">Büyük Gradient</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Renkli Butonlar</h3>
                <Button variant="success" size="md" className="w-full">Başarı</Button>
                <Button variant="warning" size="md" className="w-full">Uyarı</Button>
                <Button variant="danger" size="md" className="w-full">Tehlike</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Stil Çeşitleri</h3>
                <Button variant="primary" size="md" className="w-full">Primary</Button>
                <Button variant="secondary" size="md" className="w-full">Secondary</Button>
                <Button variant="outline" size="md" className="w-full">Outline</Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Durumlar</h3>
                <Button variant="ghost" size="md" className="w-full">Ghost</Button>
                <Button variant="primary" size="md" className="w-full" loading={true}>Yükleniyor</Button>
                <Button variant="primary" size="md" className="w-full" disabled>Devre Dışı</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="animate-slide-up">
          <h2 className="text-3xl font-bold text-gradient-hero mb-8 text-center">Etkileşimli Demo</h2>
          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🎮 Component Playground</h3>
                <p className="text-white/70 mb-6">
                  Buradaki componentler modern tasarım prensiplerine uygun olarak geliştirilmiştir. 
                  Glassmorphism efektleri, hover animasyonları ve responsive tasarım özellikleri içerir.
                </p>
                <div className="space-y-4">
                  <div className="glass-dark p-4 rounded-xl border-l-4 border-blue-400">
                    <h4 className="text-blue-300 font-semibold mb-1">🎨 Tasarım Sistemi</h4>
                    <p className="text-white/70 text-sm">Modern gradient, glassmorphism ve animasyonlar</p>
                  </div>
                  <div className="glass-dark p-4 rounded-xl border-l-4 border-green-400">
                    <h4 className="text-green-300 font-semibold mb-1">⚡ Performans</h4>
                    <p className="text-white/70 text-sm">Optimize edilmiş animasyonlar ve transitions</p>
                  </div>
                  <div className="glass-dark p-4 rounded-xl border-l-4 border-purple-400">
                    <h4 className="text-purple-300 font-semibold mb-1">📱 Responsive</h4>
                    <p className="text-white/70 text-sm">Tüm cihazlarda mükemmel görünüm</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Card variant="dark" className="h-full">
                  <CardHeader>
                    <CardTitle>🚀 Predicta Platform</CardTitle>
                    <CardDescription>
                      Modern tahmin platformu deneyimi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Toplam Kullanıcı</span>
                        <span className="text-green-400 font-bold">1,247</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Aktif Tahminler</span>
                        <span className="text-blue-400 font-bold">89</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Dağıtılan XP</span>
                        <span className="text-purple-400 font-bold">45,632</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="gradient" className="w-full">
                      🎯 Tahmin Oluştur
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
