<template>
  <div
    class="relative flex justify-center min-h-[600px] pt-[94px] items-center border-b"
  >
    <div
      class="absolute blocks-x top-0 left-[50%] right-0 bottom-0 !bg-left-top border-l"
    />
    <UiContainer
      class="relative w-full !max-w-screen-lg flex items-center py-8"
    >
      <div class="max-w-[560px]">
        <div class="eyebrow mb-3">Turn chaos to consensus</div>
        <h1 class="mb-5 font-display text-[40px] xs:text-[56px]">
          The governance stack for your organization
        </h1>
        <UiButton :to="{ name: 'my-home' }" class="primary">
          Get started
        </UiButton>
      </div>
    </UiContainer>
  </div>
</template>
