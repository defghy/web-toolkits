<script lang="ts">
  let count = $state(0)

  function increment() {
    count += 1
  }

  function decrement() {
    count -= 1
  }
</script>

<div class="counter">
  <button onclick={decrement}>-</button>
  <span class="count">{count}</span>
  <button onclick={increment}>+</button>
</div>

<style>
  .counter {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  button {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #fff;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  button:hover {
    background: #f0f0f0;
    border-color: #999;
  }

  button:active {
    transform: scale(0.95);
  }

  .count {
    min-width: 40px;
    text-align: center;
    font-size: 24px;
    font-weight: 600;
  }
</style>
