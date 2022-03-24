module.exports = {
  env: {
    //指定代码的运行环境
    browser: true,
    node: true
  },
  parser: '@typescript-eslint/parser', //定义ESLint的解析器
  extends: ['plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'], //定义文件继承的子规范，分别为react推荐规范和typescript推荐规范
  plugins: ['@typescript-eslint'], //定义了该eslint文件所依赖的插件
  settings: {
    //自动发现React的版本，从而进行规范react代码
    react: {
      pragma: 'React',
      version: 'detect'
    }
  },
  parserOptions: {
    //指定ESLint可以解析JSX语法
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    // // 可以定义react 编码规则
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // semi: ['error', 'always'],
    // eqeqeq: 'off',
    // 'linebreak-style': ['error', 'unix'],
    // 'no-useless-call': 'off',
    // 'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }]
  }
};
