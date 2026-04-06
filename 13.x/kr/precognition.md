# Precognition

- [소개](#introduction)
- [실시간 유효성 검사](#live-validation)
    - [Vue 사용하기](#using-vue)
    - [React 사용하기](#using-react)
    - [Alpine과 Blade 사용하기](#using-alpine)
    - [Axios 설정하기](#configuring-axios)
- [배열 유효성 검사](#validating-arrays)
- [유효성 검사 규칙 커스터마이징](#customizing-validation-rules)
- [파일 업로드 처리하기](#handling-file-uploads)
- [부수 효과 관리하기](#managing-side-effects)
- [테스트](#testing)

<a name="introduction"></a>
## 소개

Laravel Precognition을 사용하면 미래의 HTTP 요청 결과를 미리 예측할 수 있습니다. Precognition의 주요 사용 사례 중 하나는 백엔드의 유효성 검사 규칙을 프론트엔드 JavaScript 애플리케이션에서 중복 작성하지 않고도 "실시간" 유효성 검사를 제공하는 것입니다.

Laravel이 "사전 인지 요청(Precognitive Request)"을 받으면, 라우트의 모든 미들웨어(Middleware)를 실행하고 라우트의 컨트롤러 의존성을 해결하며, [폼 리퀘스트(Form Request)](/docs/{{version}}/validation#form-request-validation) 유효성 검사를 포함하여 모든 처리를 수행합니다. 하지만 실제로 라우트의 컨트롤러 메서드는 실행하지 않습니다.

> [!NOTE]
> Inertia 2.3부터 Precognition 지원이 내장되어 있습니다. 자세한 내용은 [Inertia Forms 문서](https://inertiajs.com/docs/v2/the-basics/forms)를 참조하세요. 이전 Inertia 버전에서는 Precognition 0.x가 필요합니다.

<a name="live-validation"></a>
## 실시간 유효성 검사

<a name="using-vue"></a>
### Vue 사용하기

Laravel Precognition을 사용하면 프론트엔드 Vue 애플리케이션에서 유효성 검사 규칙을 중복 작성하지 않고도 사용자에게 실시간 유효성 검사 경험을 제공할 수 있습니다. 작동 방식을 설명하기 위해, 애플리케이션 내에서 새 사용자를 생성하는 폼을 만들어 보겠습니다.

먼저, 라우트에 Precognition을 활성화하려면 `HandlePrecognitiveRequests` 미들웨어를 라우트 정의에 추가해야 합니다. 또한 라우트의 유효성 검사 규칙을 담을 [폼 리퀘스트(Form Request)](/docs/{{version}}/validation#form-request-validation)를 생성해야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로, NPM을 통해 Vue용 Laravel Precognition 프론트엔드 헬퍼를 설치해야 합니다.

```shell
npm install laravel-precognition-vue
```

Laravel Precognition 패키지가 설치되면, Precognition의 `useForm` 함수를 사용하여 HTTP 메서드(`post`), 대상 URL(`/users`), 초기 폼 데이터를 제공하여 폼 객체를 생성할 수 있습니다.

그런 다음 실시간 유효성 검사를 활성화하려면, 각 입력의 `change` 이벤트에서 폼의 `validate` 메서드를 호출하고 입력의 이름을 전달합니다.

```vue
<script setup>
import { useForm } from 'laravel-precognition-vue';

const form = useForm('post', '/users', {
    name: '',
    email: '',
});

const submit = () => form.submit();
</script>

<template>
    <form @submit.prevent="submit">
        <label for="name">Name</label>
        <input
            id="name"
            v-model="form.name"
            @change="form.validate('name')"
        />
        <div v-if="form.invalid('name')">
            {{ form.errors.name }}
        </div>

        <label for="email">Email</label>
        <input
            id="email"
            type="email"
            v-model="form.email"
            @change="form.validate('email')"
        />
        <div v-if="form.invalid('email')">
            {{ form.errors.email }}
        </div>

        <button :disabled="form.processing">
            Create User
        </button>
    </form>
</template>
```

이제 사용자가 폼을 입력하면, Precognition이 라우트의 폼 리퀘스트에 있는 유효성 검사 규칙을 기반으로 실시간 유효성 검사 결과를 제공합니다. 폼의 입력이 변경되면, 디바운스된 "사전 인지(Precognitive)" 유효성 검사 요청이 Laravel 애플리케이션으로 전송됩니다. 폼의 `setValidationTimeout` 함수를 호출하여 디바운스 타임아웃을 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검사 요청이 진행 중일 때, 폼의 `validating` 속성은 `true`가 됩니다.

```html
<div v-if="form.validating">
    Validating...
</div>
```

유효성 검사 요청이나 폼 제출 중에 반환된 모든 유효성 검사 오류는 자동으로 폼의 `errors` 객체에 채워집니다.

```html
<div v-if="form.invalid('email')">
    {{ form.errors.email }}
</div>
```

폼의 `hasErrors` 속성을 사용하여 폼에 오류가 있는지 확인할 수 있습니다.

```html
<div v-if="form.hasErrors">
    <!-- ... -->
</div>
```

입력의 이름을 폼의 `valid` 및 `invalid` 함수에 각각 전달하여 입력이 유효성 검사를 통과했는지 실패했는지 확인할 수도 있습니다.

```html
<span v-if="form.valid('email')">
    ✅
</span>

<span v-else-if="form.invalid('email')">
    ❌
</span>
```

> [!WARNING]
> 폼 입력은 변경되고 유효성 검사 응답을 받은 후에만 유효 또는 무효로 표시됩니다.

Precognition으로 폼 입력의 일부만 유효성 검사하는 경우, 수동으로 오류를 지우는 것이 유용할 수 있습니다. 폼의 `forgetError` 함수를 사용하여 이를 수행할 수 있습니다.

```html
<input
    id="avatar"
    type="file"
    @change="(e) => {
        form.avatar = e.target.files[0]

        form.forgetError('avatar')
    }"
>
```

지금까지 살펴본 것처럼, 입력의 `change` 이벤트에 연결하여 사용자가 상호작용할 때 개별 입력의 유효성을 검사할 수 있습니다. 그러나 사용자가 아직 상호작용하지 않은 입력의 유효성을 검사해야 할 수도 있습니다. 이는 "마법사(Wizard)" 형태의 폼을 구축할 때 일반적인데, 다음 단계로 넘어가기 전에 사용자가 상호작용했는지 여부와 관계없이 모든 표시된 입력의 유효성을 검사하려는 경우입니다.

Precognition으로 이를 수행하려면, `validate` 메서드를 호출하고 유효성을 검사하려는 필드 이름을 `only` 설정 키에 전달해야 합니다. `onSuccess` 또는 `onValidationError` 콜백으로 유효성 검사 결과를 처리할 수 있습니다.

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

물론, 폼 제출에 대한 응답에 반응하여 코드를 실행할 수도 있습니다. 폼의 `submit` 함수는 Axios 요청 프로미스(Promise)를 반환합니다. 이를 통해 응답 페이로드에 접근하고, 성공적인 제출 시 폼 입력을 재설정하거나, 실패한 요청을 처리하는 편리한 방법을 제공합니다.

```js
const submit = () => form.submit()
    .then(response => {
        form.reset();

        alert('User created.');
    })
    .catch(error => {
        alert('An error occurred.');
    });
```

폼의 `processing` 속성을 검사하여 폼 제출 요청이 진행 중인지 확인할 수 있습니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="using-react"></a>
### React 사용하기

Laravel Precognition을 사용하면 프론트엔드 React 애플리케이션에서 유효성 검사 규칙을 중복 작성하지 않고도 사용자에게 실시간 유효성 검사 경험을 제공할 수 있습니다. 작동 방식을 설명하기 위해, 애플리케이션 내에서 새 사용자를 생성하는 폼을 만들어 보겠습니다.

먼저, 라우트에 Precognition을 활성화하려면 `HandlePrecognitiveRequests` 미들웨어를 라우트 정의에 추가해야 합니다. 또한 라우트의 유효성 검사 규칙을 담을 [폼 리퀘스트(Form Request)](/docs/{{version}}/validation#form-request-validation)를 생성해야 합니다.

```php
use App\Http\Requests\StoreUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (StoreUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로, NPM을 통해 React용 Laravel Precognition 프론트엔드 헬퍼를 설치해야 합니다.

```shell
npm install laravel-precognition-react
```

Laravel Precognition 패키지가 설치되면, Precognition의 `useForm` 함수를 사용하여 HTTP 메서드(`post`), 대상 URL(`/users`), 초기 폼 데이터를 제공하여 폼 객체를 생성할 수 있습니다.

실시간 유효성 검사를 활성화하려면, 각 입력의 `change` 및 `blur` 이벤트를 수신해야 합니다. `change` 이벤트 핸들러에서는 `setData` 함수로 폼 데이터를 설정하고, 입력의 이름과 새 값을 전달합니다. 그런 다음 `blur` 이벤트 핸들러에서 폼의 `validate` 메서드를 호출하고 입력의 이름을 전달합니다.

```jsx
import { useForm } from 'laravel-precognition-react';

export default function Form() {
    const form = useForm('post', '/users', {
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        form.submit();
    };

    return (
        <form onSubmit={submit}>
            <label htmlFor="name">Name</label>
            <input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                onBlur={() => form.validate('name')}
            />
            {form.invalid('name') && <div>{form.errors.name}</div>}

            <label htmlFor="email">Email</label>
            <input
                id="email"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                onBlur={() => form.validate('email')}
            />
            {form.invalid('email') && <div>{form.errors.email}</div>}

            <button disabled={form.processing}>
                Create User
            </button>
        </form>
    );
};
```

이제 사용자가 폼을 입력하면, Precognition이 라우트의 폼 리퀘스트에 있는 유효성 검사 규칙을 기반으로 실시간 유효성 검사 결과를 제공합니다. 폼의 입력이 변경되면, 디바운스된 "사전 인지(Precognitive)" 유효성 검사 요청이 Laravel 애플리케이션으로 전송됩니다. 폼의 `setValidationTimeout` 함수를 호출하여 디바운스 타임아웃을 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검사 요청이 진행 중일 때, 폼의 `validating` 속성은 `true`가 됩니다.

```jsx
{form.validating && <div>Validating...</div>}
```

유효성 검사 요청이나 폼 제출 중에 반환된 모든 유효성 검사 오류는 자동으로 폼의 `errors` 객체에 채워집니다.

```jsx
{form.invalid('email') && <div>{form.errors.email}</div>}
```

폼의 `hasErrors` 속성을 사용하여 폼에 오류가 있는지 확인할 수 있습니다.

```jsx
{form.hasErrors && <div><!-- ... --></div>}
```

입력의 이름을 폼의 `valid` 및 `invalid` 함수에 각각 전달하여 입력이 유효성 검사를 통과했는지 실패했는지 확인할 수도 있습니다.

```jsx
{form.valid('email') && <span>✅</span>}

{form.invalid('email') && <span>❌</span>}
```

> [!WARNING]
> 폼 입력은 변경되고 유효성 검사 응답을 받은 후에만 유효 또는 무효로 표시됩니다.

Precognition으로 폼 입력의 일부만 유효성 검사하는 경우, 수동으로 오류를 지우는 것이 유용할 수 있습니다. 폼의 `forgetError` 함수를 사용하여 이를 수행할 수 있습니다.

```jsx
<input
    id="avatar"
    type="file"
    onChange={(e) => {
        form.setData('avatar', e.target.files[0]);

        form.forgetError('avatar');
    }}
>
```

지금까지 살펴본 것처럼, 입력의 `blur` 이벤트에 연결하여 사용자가 상호작용할 때 개별 입력의 유효성을 검사할 수 있습니다. 그러나 사용자가 아직 상호작용하지 않은 입력의 유효성을 검사해야 할 수도 있습니다. 이는 "마법사(Wizard)" 형태의 폼을 구축할 때 일반적인데, 다음 단계로 넘어가기 전에 사용자가 상호작용했는지 여부와 관계없이 모든 표시된 입력의 유효성을 검사하려는 경우입니다.

Precognition으로 이를 수행하려면, `validate` 메서드를 호출하고 유효성을 검사하려는 필드 이름을 `only` 설정 키에 전달해야 합니다. `onSuccess` 또는 `onValidationError` 콜백으로 유효성 검사 결과를 처리할 수 있습니다.

```jsx
<button
    type="button"
    onClick={() => form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })}
>Next Step</button>
```

물론, 폼 제출에 대한 응답에 반응하여 코드를 실행할 수도 있습니다. 폼의 `submit` 함수는 Axios 요청 프로미스(Promise)를 반환합니다. 이를 통해 응답 페이로드에 접근하고, 성공적인 폼 제출 시 폼 입력을 재설정하거나, 실패한 요청을 처리하는 편리한 방법을 제공합니다.

```js
const submit = (e) => {
    e.preventDefault();

    form.submit()
        .then(response => {
            form.reset();

            alert('User created.');
        })
        .catch(error => {
            alert('An error occurred.');
        });
};
```

폼의 `processing` 속성을 검사하여 폼 제출 요청이 진행 중인지 확인할 수 있습니다.

```html
<button disabled={form.processing}>
    Submit
</button>
```

<a name="using-alpine"></a>
### Alpine과 Blade 사용하기

Laravel Precognition을 사용하면 프론트엔드 Alpine 애플리케이션에서 유효성 검사 규칙을 중복 작성하지 않고도 사용자에게 실시간 유효성 검사 경험을 제공할 수 있습니다. 작동 방식을 설명하기 위해, 애플리케이션 내에서 새 사용자를 생성하는 폼을 만들어 보겠습니다.

먼저, 라우트에 Precognition을 활성화하려면 `HandlePrecognitiveRequests` 미들웨어를 라우트 정의에 추가해야 합니다. 또한 라우트의 유효성 검사 규칙을 담을 [폼 리퀘스트(Form Request)](/docs/{{version}}/validation#form-request-validation)를 생성해야 합니다.

```php
use App\Http\Requests\CreateUserRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;

Route::post('/users', function (CreateUserRequest $request) {
    // ...
})->middleware([HandlePrecognitiveRequests::class]);
```

다음으로, NPM을 통해 Alpine용 Laravel Precognition 프론트엔드 헬퍼를 설치해야 합니다.

```shell
npm install laravel-precognition-alpine
```

그런 다음, `resources/js/app.js` 파일에서 Alpine에 Precognition 플러그인을 등록합니다.

```js
import Alpine from 'alpinejs';
import Precognition from 'laravel-precognition-alpine';

window.Alpine = Alpine;

Alpine.plugin(Precognition);
Alpine.start();
```

Laravel Precognition 패키지가 설치되고 등록되면, Precognition의 `$form` "매직(Magic)"을 사용하여 HTTP 메서드(`post`), 대상 URL(`/users`), 초기 폼 데이터를 제공하여 폼 객체를 생성할 수 있습니다.

실시간 유효성 검사를 활성화하려면, 폼 데이터를 관련 입력에 바인딩한 다음 각 입력의 `change` 이벤트를 수신해야 합니다. `change` 이벤트 핸들러에서 폼의 `validate` 메서드를 호출하고 입력의 이름을 전달합니다.

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '',
        email: '',
    }),
}">
    @csrf
    <label for="name">Name</label>
    <input
        id="name"
        name="name"
        x-model="form.name"
        @change="form.validate('name')"
    />
    <template x-if="form.invalid('name')">
        <div x-text="form.errors.name"></div>
    </template>

    <label for="email">Email</label>
    <input
        id="email"
        name="email"
        x-model="form.email"
        @change="form.validate('email')"
    />
    <template x-if="form.invalid('email')">
        <div x-text="form.errors.email"></div>
    </template>

    <button :disabled="form.processing">
        Create User
    </button>
</form>
```

이제 사용자가 폼을 입력하면, Precognition이 라우트의 폼 리퀘스트에 있는 유효성 검사 규칙을 기반으로 실시간 유효성 검사 결과를 제공합니다. 폼의 입력이 변경되면, 디바운스된 "사전 인지(Precognitive)" 유효성 검사 요청이 Laravel 애플리케이션으로 전송됩니다. 폼의 `setValidationTimeout` 함수를 호출하여 디바운스 타임아웃을 설정할 수 있습니다.

```js
form.setValidationTimeout(3000);
```

유효성 검사 요청이 진행 중일 때, 폼의 `validating` 속성은 `true`가 됩니다.

```html
<template x-if="form.validating">
    <div>Validating...</div>
</template>
```

유효성 검사 요청이나 폼 제출 중에 반환된 모든 유효성 검사 오류는 자동으로 폼의 `errors` 객체에 채워집니다.

```html
<template x-if="form.invalid('email')">
    <div x-text="form.errors.email"></div>
</template>
```

폼의 `hasErrors` 속성을 사용하여 폼에 오류가 있는지 확인할 수 있습니다.

```html
<template x-if="form.hasErrors">
    <div><!-- ... --></div>
</template>
```

입력의 이름을 폼의 `valid` 및 `invalid` 함수에 각각 전달하여 입력이 유효성 검사를 통과했는지 실패했는지 확인할 수도 있습니다.

```html
<template x-if="form.valid('email')">
    <span>✅</span>
</template>

<template x-if="form.invalid('email')">
    <span>❌</span>
</template>
```

> [!WARNING]
> 폼 입력은 변경되고 유효성 검사 응답을 받은 후에만 유효 또는 무효로 표시됩니다.

지금까지 살펴본 것처럼, 입력의 `change` 이벤트에 연결하여 사용자가 상호작용할 때 개별 입력의 유효성을 검사할 수 있습니다. 그러나 사용자가 아직 상호작용하지 않은 입력의 유효성을 검사해야 할 수도 있습니다. 이는 "마법사(Wizard)" 형태의 폼을 구축할 때 일반적인데, 다음 단계로 넘어가기 전에 사용자가 상호작용했는지 여부와 관계없이 모든 표시된 입력의 유효성을 검사하려는 경우입니다.

Precognition으로 이를 수행하려면, `validate` 메서드를 호출하고 유효성을 검사하려는 필드 이름을 `only` 설정 키에 전달해야 합니다. `onSuccess` 또는 `onValidationError` 콜백으로 유효성 검사 결과를 처리할 수 있습니다.

```html
<button
    type="button"
    @click="form.validate({
        only: ['name', 'email', 'phone'],
        onSuccess: (response) => nextStep(),
        onValidationError: (response) => /* ... */,
    })"
>Next Step</button>
```

폼의 `processing` 속성을 검사하여 폼 제출 요청이 진행 중인지 확인할 수 있습니다.

```html
<button :disabled="form.processing">
    Submit
</button>
```

<a name="repopulating-old-form-data"></a>
#### 이전 폼 데이터 다시 채우기

위에서 논의한 사용자 생성 예제에서는 Precognition을 사용하여 실시간 유효성 검사를 수행하지만, 폼 제출은 전통적인 서버 측 폼 제출을 수행합니다. 따라서 폼은 서버 측 폼 제출에서 반환된 "이전(old)" 입력값과 유효성 검사 오류로 채워져야 합니다.

```html
<form x-data="{
    form: $form('post', '/register', {
        name: '{{ old('name') }}',
        email: '{{ old('email') }}',
    }).setErrors({{ Js::from($errors->messages()) }}),
}">
```

또는, XHR을 통해 폼을 제출하려면 Axios 요청 프로미스(Promise)를 반환하는 폼의 `submit` 함수를 사용할 수 있습니다.

```html
<form
    x-data="{
        form: $form('post', '/register', {
            name: '',
            email: '',
        }),
        submit() {
            this.form.submit()
                .then(response => {
                    this.form.reset();

                    alert('User created.')
                })
                .catch(error => {
                    alert('An error occurred.');
                });
        },
    }"
    @submit.prevent="submit"
>
```

<a name="configuring-axios"></a>
### Axios 설정하기

Precognition 유효성 검사 라이브러리는 [Axios](https://github.com/axios/axios) HTTP 클라이언트를 사용하여 애플리케이션의 백엔드로 요청을 보냅니다. 편의를 위해, 애플리케이션에서 필요한 경우 Axios 인스턴스를 커스터마이징할 수 있습니다. 예를 들어, `laravel-precognition-vue` 라이브러리를 사용할 때, 애플리케이션의 `resources/js/app.js` 파일에서 모든 발신 요청에 추가 요청 헤더를 추가할 수 있습니다.

```js
import { client } from 'laravel-precognition-vue';

client.axios().defaults.headers.common['Authorization'] = authToken;
```

또는, 이미 애플리케이션에 설정된 Axios 인스턴스가 있는 경우, Precognition이 해당 인스턴스를 사용하도록 지정할 수 있습니다.

```js
import Axios from 'axios';
import { client } from 'laravel-precognition-vue';

window.axios = Axios.create()
window.axios.defaults.headers.common['Authorization'] = authToken;

client.use(window.axios)
```

<a name="validating-arrays"></a>
## 배열 유효성 검사

와일드카드를 사용하여 배열이나 중첩된 객체 내의 필드를 유효성 검사할 수 있습니다. 각 `*`는 단일 경로 세그먼트에 매칭됩니다.

```js
// 배열 내 모든 사용자의 이메일을 유효성 검사...
form.validate('users.*.email');

// 프로필 객체의 모든 필드를 유효성 검사...
form.validate('profile.*');

// 모든 사용자의 모든 필드를 유효성 검사...
form.validate('users.*.*');
```

<a name="customizing-validation-rules"></a>
## 유효성 검사 규칙 커스터마이징

요청의 `isPrecognitive` 메서드를 사용하여 사전 인지 요청 중에 실행되는 유효성 검사 규칙을 커스터마이징할 수 있습니다.

예를 들어, 사용자 생성 폼에서 비밀번호가 "유출되지 않았는지(uncompromised)" 최종 폼 제출에서만 검증하고 싶을 수 있습니다. 사전 인지 유효성 검사 요청에서는 비밀번호가 필수이고 최소 8자 이상인지만 검증합니다. `isPrecognitive` 메서드를 사용하여 폼 리퀘스트에서 정의된 규칙을 커스터마이징할 수 있습니다.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * 요청에 적용되는 유효성 검사 규칙을 가져옵니다.
     *
     * @return array
     */
    protected function rules()
    {
        return [
            'password' => [
                'required',
                $this->isPrecognitive()
                    ? Password::min(8)
                    : Password::min(8)->uncompromised(),
            ],
            // ...
        ];
    }
}
```

<a name="handling-file-uploads"></a>
## 파일 업로드 처리하기

기본적으로 Laravel Precognition은 사전 인지 유효성 검사 요청 중에 파일을 업로드하거나 유효성을 검사하지 않습니다. 이는 큰 파일이 불필요하게 여러 번 업로드되지 않도록 보장합니다.

이러한 동작 때문에, 해당 필드가 전체 폼 제출에서만 필수임을 지정하도록 애플리케이션의 [해당 폼 리퀘스트의 유효성 검사 규칙을 커스터마이징](#customizing-validation-rules)해야 합니다.

```php
/**
 * 요청에 적용되는 유효성 검사 규칙을 가져옵니다.
 *
 * @return array
 */
protected function rules()
{
    return [
        'avatar' => [
            ...$this->isPrecognitive() ? [] : ['required'],
            'image',
            'mimes:jpg,png',
            'dimensions:ratio=3/2',
        ],
        // ...
    ];
}
```

모든 유효성 검사 요청에 파일을 포함하려면, 클라이언트 측 폼 인스턴스에서 `validateFiles` 함수를 호출하면 됩니다.

```js
form.validateFiles();
```

<a name="managing-side-effects"></a>
## 부수 효과 관리하기

라우트에 `HandlePrecognitiveRequests` 미들웨어를 추가할 때, 사전 인지 요청 중에 건너뛰어야 하는 _다른_ 미들웨어의 부수 효과가 있는지 고려해야 합니다.

예를 들어, 각 사용자가 애플리케이션과 가진 총 "상호작용" 횟수를 증가시키는 미들웨어가 있을 수 있는데, 사전 인지 요청은 상호작용으로 계산하고 싶지 않을 수 있습니다. 이를 달성하기 위해, 상호작용 횟수를 증가시키기 전에 요청의 `isPrecognitive` 메서드를 확인할 수 있습니다.

```php
<?php

namespace App\Http\Middleware;

use App\Facades\Interaction;
use Closure;
use Illuminate\Http\Request;

class InteractionMiddleware
{
    /**
     * 들어오는 요청을 처리합니다.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (! $request->isPrecognitive()) {
            Interaction::incrementFor($request->user());
        }

        return $next($request);
    }
}
```

<a name="testing"></a>
## 테스트

테스트에서 사전 인지 요청을 만들고 싶다면, Laravel의 `TestCase`에는 `Precognition` 요청 헤더를 추가하는 `withPrecognition` 헬퍼가 포함되어 있습니다.

또한, 사전 인지 요청이 성공했는지(예: 유효성 검사 오류가 반환되지 않았는지) 확인하려면, 응답에서 `assertSuccessfulPrecognition` 메서드를 사용할 수 있습니다.

```php tab=Pest
it('validates registration form with precognition', function () {
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();

    expect(User::count())->toBe(0);
});
```

```php tab=PHPUnit
public function test_it_validates_registration_form_with_precognition()
{
    $response = $this->withPrecognition()
        ->post('/register', [
            'name' => 'Taylor Otwell',
        ]);

    $response->assertSuccessfulPrecognition();
    $this->assertSame(0, User::count());
}
```
