<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Swarm Panel</h1>
        <p class="text-slate-500 mt-2">Giriş yap</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="user@example.com"
            :disabled="loading"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
            Şifre
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors"
        >
          {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>

      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500">
          Hesabınız yok mu?
          <button
            @click="showSignUp = true"
            class="text-blue-500 hover:text-blue-600 font-semibold"
          >
            Kaydol
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({ email: '', password: '' });
const loading = ref(false);
const error = ref('');
const showSignUp = ref(false);

async function handleLogin() {
  if (!form.value.email || !form.value.password) {
    error.value = 'Lütfen tüm alanları doldurun';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: form.value.email,
        password: form.value.password,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Giriş başarısız');
    }

    await router.push('/dashboard');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Bir hata oluştu';
  } finally {
    loading.value = false;
  }
}
</script>
