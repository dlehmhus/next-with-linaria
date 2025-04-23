export const LINARIA_MODULE_EXTENSION = '.linaria.module';
export const LINARIA_GLOBAL_EXTENSION = '.linaria.global';

export const regexLinariaCSS = /\.linaria\.(module|global)\.css$/;
export const regexIsLinariaGlobalCSSQuery = /\.linaria\.global\.css\?/;
export const regexLinariaCSSQuery = /\.linaria\.(module|global)\.css\?/;

// Pattern to quickly check if file potentially contains Linaria syntax
export const regexLinariaSyntaxPattern = /(styled[.(]|css`)/;
