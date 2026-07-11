<template>
  <div class="page-loading">
    <span class="page-spinner"></span>
  </div>
</template>

<style lang="scss" scoped>
.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.page-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(212, 168, 67, 0.15);
  border-top-color: #d4a843;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
