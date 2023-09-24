<script>
    export let user;
</script>

<div class="w-full lg:max-w-full lg:flex">
    <div class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" style="background-image: url('/mountain.jpg')" title="Mountain">
    </div>
    <div class="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
        <div class="mb-8">
            {#if user.admin}
            <p class="text-sm text-gray-600 flex items-center">
                Admin
            </p>
            {/if}
          <div class="text-gray-900 font-bold text-xl mb-2">{ user.name }</div>
          <p class="text-gray-700 text-base">{ user.description || "" }</p>
        </div>
        <div class="flex items-center">
            <img class="w-10 h-10 rounded-full mr-4" src="{ user.img }" alt="Avatar of Writer">
            <div class="text-sm">
                <p class="text-gray-900 leading-none">{ user.email }</p>
                <p class="text-gray-600">{ user.createdAt || "" }</p>
            </div>
        </div>
    </div>
</div>