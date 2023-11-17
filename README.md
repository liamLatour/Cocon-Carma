# CoconCarma

![](logo.jpg) 

CoconCarma is a simple Apache Cordova application that serves as a smart cash register, providing intelligent features for managing products, orders, and payments.

## Table of Contents 

- [CoconCarma](#coconcarma)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration](#configuration)
  - [Testing](#testing)
  - [Contributing](#contributing)
  - [License](#license)

## Description

CoconCarma is a mobile application developed using Apache Cordova. It provides a user-friendly interface for managing products, handling orders, and processing payments. The application is designed to be responsive and compatible with Android and browser platforms.

## Installation

To install CoconCarma on your device, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/liamlatour/Cocon-Carma.git
``` 
2. Navigate to the `CoconCarma` directory:

```bash
cd Cocon-Carma/CoconCarma
``` 
3. Install dependencies:

```bash
npm install
``` 
4. Build the Cordova project:

```bash
cordova build
``` 
5. Run the application on Android:

```bash
cordova run android
```

## Usage

After installing the application, follow these steps to use CoconCarma:

1. Open the application on your device.
2. The main screen displays a menu with different product categories.
3. Click on a category to view the available products.
4. Add products to the order by clicking on them.
5. Use the payment panel to finalize the order, specifying the payment mode.

## Configuration

CoconCarma's configuration is defined in the `config.xml` file. Customize the configuration according to your requirements. Key configurations include:

- App ID and version
- Description
- Author information
- Content source
- Whitelist settings
- Access permissions
- Android platform configurations

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.fainting.CoconCarma" version="1.2.3" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <!-- Configuration details -->
</widget>
```

## Testing

CoconCarma includes unit tests to ensure the reliability of its functionalities. The tests are written using Jasmine and can be found in the `UnitTests` directory. Run the tests using the following command:

```bash
npm test
```

## Contributing

We welcome contributions to enhance CoconCarma. Feel free to fork the repository, make improvements, and submit pull requests. Follow these steps:

1. Fork the repository. 
2. Create a new branch:

```bash
git checkout -b feature/your-feature
``` 
3. Make your changes and commit them:

```bash
git commit -m "Add your feature"
``` 
4. Push to the branch:

```bash
git push origin feature/your-feature
``` 
5. Open a pull request.

## License

CoconCarma is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit/)  file for details.
