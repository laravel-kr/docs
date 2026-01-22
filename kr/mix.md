# 라라벨 믹스(Laravel Mix)

- [소개](#introduction)

<a name="introduction"></a>
## 소개

[Laravel Mix](https://github.com/laravel-mix/laravel-mix)는 [Laracasts](https://laracasts.com) 창시자인 Jeffrey Way가 개발한 패키지로, 일반적으로 사용되는 여러 CSS 및 JavaScript 전처리기를 사용하여 라라벨 애플리케이션의 [webpack](https://webpack.js.org) 빌드 단계를 정의할 수 있는 유연한 API를 제공합니다.

다시 말해, Mix를 사용하면 애플리케이션의 CSS 및 JavaScript 파일을 손쉽게 컴파일하고 압축할 수 있습니다. 간단한 메서드 체이닝을 통해 에셋 파이프라인을 유연하게 정의할 수 있습니다. 예를 들어:

```js
mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css');
```

webpack과 에셋 컴파일을 시작하는 방법에 대해 혼란스럽고 압도당한 적이 있다면, Laravel Mix를 좋아하게 될 것입니다. 하지만, 애플리케이션을 개발하는 동안 반드시 사용해야 하는 것은 아닙니다. 원하는 에셋 파이프라인 도구를 자유롭게 사용하거나, 아예 사용하지 않아도 됩니다.

> [!NOTE]
> Vite가 새로운 라라벨 설치에서 Laravel Mix를 대체했습니다. Mix 문서는 [공식 Laravel Mix](https://laravel-mix.com/) 웹사이트를 참조하세요. Vite로 전환하고 싶다면, [Vite 마이그레이션 가이드](https://github.com/laravel/vite-plugin/blob/main/UPGRADE.md#migrating-from-laravel-mix-to-vite)를 참조하세요.
