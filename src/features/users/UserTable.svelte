<script lang="ts">
	import type { UserSummary } from './api';

	let { users, onselect }: { users: UserSummary[]; onselect: (user: UserSummary) => void } = $props();

	function roleText(user: UserSummary) {
		return user.roles.length ? user.roles.map((item) => item.role).join(', ') : 'Belum ada peran';
	}
</script>

<div class="table-wrap">
	<table>
		<caption>Daftar pengguna</caption>
		<thead><tr><th>Nama tampilan</th><th>Nama pengguna</th><th>Email</th><th>Peran</th><th>Status</th><th>Aksi</th></tr></thead>
		<tbody>
			{#each users as user (user.id)}
				<tr>
					<td>{user.display_name}</td>
					<td>{user.username ?? 'Belum diaktifkan'}</td>
					<td>{user.email}</td>
					<td>{roleText(user)}</td>
					<td><span class:disabled={!user.enabled} class="badge">{user.enabled ? 'Aktif' : 'Nonaktif'}</span></td>
					<td><button class="secondary" type="button" onclick={() => onselect(user)} aria-label={`Lihat ${user.display_name}`}>Lihat</button></td>
				</tr>
			{:else}
				<tr><td colspan="6" class="empty">Belum ada pengguna.</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-wrap { overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	table { width: 100%; border-collapse: collapse; min-width: 48rem; }
	caption { padding: var(--space-4); text-align: left; font-size: 1.05rem; font-weight: 800; }
	th, td { padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border); text-align: left; vertical-align: top; }
	th { color: var(--color-text-muted); font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; }
	.empty { color: var(--color-text-muted); text-align: center; }
	.badge { padding: .3rem .65rem; border-radius: 99rem; background: var(--color-primary-soft); color: var(--color-primary); font-size: .8rem; font-weight: 700; }
	.badge.disabled { background: var(--color-border); color: var(--color-text-muted); }
	button { min-height: 2.3rem; padding: .35rem .7rem; border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-surface); font-weight: 700; cursor: pointer; }
	button.secondary { border-color: var(--color-border); background: var(--color-surface); color: var(--color-primary); }
</style>
