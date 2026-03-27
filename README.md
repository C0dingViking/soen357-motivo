# soen357-motivo

Repository for Motivo, a habit forming app, built for the SOEN 357 term project

## Motivo Mobile Prototype

This is the mobile frontend prototype for **Motivo**, built using React Native and Expo.

---

## Dependencies

Make sure you have the following installed:

- [**Node.js**](https://nodejs.org/en/download) (recommended: LTS version)
  - **npm** (comes with Node)
- [**Git**](https://git-scm.com/install/)

> [!NOTE]  
> You can verify installations with the commands below:
>
> ```bash
> node -v
> npm -v
> git --version
> ```

---

## Quick Start

> [!IMPORTANT]  
> Further details are provided below, this is meant as a reminder once properly set up by following the sections below.

```bash
cd soen357-motivo/motivo
npm install
npx expo start
```

Then press `a` to open in an ***android*** emulator.

---

## Running the Prototype

### 1. Clone the Repository

```bash
git clone https://github.com/C0dingViking/soen357-motivo.git
cd soen357-motivo/motivo
```

### 2. Install the Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npx expo start
```

## Opening the Prototype

Expo provides different methods to open the application, only two will be covered:

- Android Emulator
- Personal Phone

### Android Emulator (Recommended)

1. Install [Android Studio](https://developer.android.com/studio)
2. Set up an Android Virtual Device by following the [Android Studio documentation](https://developer.android.com/studio/run/managing-avds#createavd)  
    - Recommended API Level: 30+
3. In the terminal with expo running (i.e. the terminal in which you ran the `npx expo start` command), press `a`
    - This will launch the emulator and open the app

### Physical Phone

1. Install Expo Go on your phone via the app store
2. Start the app with:

    ```bash
    npx expo start --lan
    ```

3. Ensure your phone and computer are on the same network
4. Scan the QR code shown in the terminal in the Expo Go app

> [!WARNING]  
> If the `--lan` mode does not work, try running it in `--tunnel` mode.  
> However, this mode may not work due to compatibility issues with ngrok and Expo.  
> > If both the `--lan` and `--tunnel` mode do not work, try connecting your computer to your phone's hotspot and run Expo using `npx expo start --lan`

---

## Troubleshooting

### Clear the Cache

```bash
npx expo start -c
```

***OR***

```bash
npx expo start --clear
```

### Reinstalling the Dependencies

In Linux systems, run:

```bash
rm -rf node_modules package-lock.json
npm install
```

***OR***

Manually delete the `node_modules` folder and the `package-lock.json` file from your IDE of choice or file explorer.
