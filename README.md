# EdMeds.shop preview app

This repository hosts the marketing preview for **EdMeds.shop**, a US-based ISO-compliant medical store and virtual health consultancy. The site showcases the product catalog, free consultancy program, testimonials, and platform download links for the upcoming iOS, Android, and web experiences.

## Quick start

```bash
npm install
npm run dev
```

By default Vite serves the site on <http://localhost:5173>. When running inside GitHub Codespaces or other remote environments, be sure to forward that port so you can open the preview in your browser.

## Shareable browser preview

If you need to expose the preview beyond `localhost`, start the development server on an explicit host and port:

```bash
npm run dev:host
```

The script binds Vite to `0.0.0.0:4173`, which makes it easy to use port forwarding tools (including Visual Studio and Codespaces) to share the preview with teammates.

## Visual Studio Code integration

The `.vscode/` folder contains ready-to-run launch and task configurations. Open the repository in Visual Studio Code and press <kbd>F5</kbd> to start the `Vite: dev server` task and attach Chrome automatically. There is also a `Vite: build` task for generating a production bundle without leaving the editor.

## Production build

```bash
npm run build
```

The compiled assets are output to the `dist/` directory, ready to deploy to static hosting or to integrate with an Amplify backend.

## License

This project is released under the [MIT-0 License](LICENSE).
