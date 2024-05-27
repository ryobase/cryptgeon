<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import { onMount } from 'svelte'
	import { waitLocale } from 'svelte-intl-precompile'

	import '../app.css'

	import { init as initStores, status } from '$lib/stores/status'
	import Footer from '$lib/views/Footer.svelte'
	import Header from '$lib/views/Header.svelte'
	import { API } from '@cryptgeon/shared'
	import { PUBLIC_PREFIX_ROUTE } from '$env/static/public';

	onMount(() => {
		const api = new API('', PUBLIC_PREFIX_ROUTE ?? '')
		initStores(api)
	})
</script>

<svelte:head>
	<title>{$status?.theme_page_title || 'cryptgeon'}</title>
	<link rel="icon" href={$status?.theme_favicon || '/favicon.png'} />
</svelte:head>

{#await waitLocale() then _}
	<main>
		<Header />
		<slot />
	</main>

	<SvelteToast />

	<Footer />
{/await}

<style>
	main {
		padding: 1rem;
		padding-bottom: 4rem;
		width: 100%;
		max-width: 35rem;
		margin: 0 auto;
	}
</style>
