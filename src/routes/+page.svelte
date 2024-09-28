<script>
  import { AVAILABLE_LANGUAGES } from '$lib/data/languages.js';

  let username = '';
  let selectedLanguage = 'English';

  let loading = false;
  let roastResponse = '';
  let errResponse = '';

  async function judgeUser() {
    loading = true;
    roastResponse = '';
    errResponse = '';

    try {
      const response = await fetch('/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, selectedLanguage }),
        cache: 'force-cache',
      });

      const result = await response.json();

      if (response.ok) {
        roastResponse = result?.roast ?? 'No roast available';
      } else {
        errResponse =
          result?.error ?? `${response.status} ${response.statusText}`;
      }
    } catch (error) {
      errResponse = error.message || 'Unknown error';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Last.fm Roast</title>
</svelte:head>

<header class="container">
  <hgroup>
    <h1>Last.fm Roast</h1>
    <p>No offense, it's AI-generated. Have fun!</p>
  </hgroup>
</header>

<main class="container">
  <section id="form">
    <form on:submit|preventDefault={judgeUser}>
      <label for="username"
        >Enter <u data-tooltip="https://last.fm/user/johndoe">username</u
        >:</label
      >
      <input
        id="username"
        type="text"
        bind:value={username}
        placeholder="johndoe"
      />

      <label for="language">Select language:</label>
      <select id="selected_language" bind:value={selectedLanguage}>
        {#each AVAILABLE_LANGUAGES as language}
          <option value={language}>{language}</option>
        {/each}
      </select>

      <button
        type="submit"
        class="primary"
        aria-busy={loading ? 'true' : 'false'}
        disabled={loading || !username || !selectedLanguage}
        >{loading ? 'Roasting...' : 'Roast!'}</button
      >
    </form>
  </section>

  <section id="response">
    {#if errResponse}
      <article>
        <h2>Error</h2>
        <p>{errResponse}</p>
      </article>
    {/if}

    {#if roastResponse}
      <article>
        <h2>Eat this!</h2>
        <p>{roastResponse}</p>
      </article>
    {/if}
  </section>
</main>

<footer class="container center-footer">
  <small>
    Rifqi Haidar &copy; 2024 • <a href="https://github.com/erhaem/lastfm-roast"
      >Source Code</a
    ></small
  >
</footer>
