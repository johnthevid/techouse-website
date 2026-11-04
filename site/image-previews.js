/** Tiny, pre-blurred local previews; no full-size duplicate downloads or ongoing blur. */
(() => {
  const previews = {
    'assets/biglite-building-interior.webp':
      'data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAADQBACdASoSABgAPwl2sFArp6SisBgMAXAhCWUAyJgPCrzo0a2gpRxU7/Y5A+D3IAD+qGPvaFvSGSQL/TnQNxmxIH2w89sUEXS0L0qRlWZsdvJYoiHDvm2aHplagAAA',
    'assets/development.c87084358595.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAQBACdASoYABAAPxFwsFAsJiSisAgBgCIJaACdMoADTWxXYppU7rGNqAD+2N9YMCgTU7iCCjP7iZL83QYHCDGRVBS9Pi4cQB2Nb5tyZ1lDAQYeEAA=',
    'assets/techouse-logo-horizontal.png':
      'data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAABQAwCdASoYAAgAPxF0slCsJqSisAgBgCIJZQAAW+s26HAvgAD+4JkUO3RUaa8+l5s0na5//YXBueQAAAA=',
    'assets/solar.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACwAwCdASoYAA4APxGCtFIsKaUisAgBgCIJYgCsAB0ydq0I3tyDNAD6jkp3MC8l3xv2447aEUUPAi5tZB8oDW1Mz2MxBPWDeA7vPg1ysnucYIcAAAA=',
    'assets/architecture.26e250a22279.jpg':
      'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAwCdASoYABAAPxF0sFAsJySisAgBgCIJQBWAAWcwjdfs6cgYAADMQZlkX3KxN0M8ktF1cjzzVEr+kMCM48Kw7ZP6w0uSeoVfXybz+LNxDqFpCCZWAAAA',
    'assets/construction.5154dbc7c67d.jpg':
      'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAABwAwCdASoYABAAPxF0sVAsJySisAgBgCIJZwAAUbo/hjY/FWAA/oDhcBnQIOcsrAknuQqqeJ1lDXwuqSnhwyMFUBRRwAAA',
    'assets/development.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAQBACdASoYABAAPxFwsFAsJiSisAgBgCIJaACdMoADTWxXYppU7rGNqAD+2N9YMCgTU7iCCjP7iZL83QYHCDGRVBS9Pi4cQB2Nb5tyZ1lDAQYeEAA=',
    'assets/construction.jpg':
      'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAABwAwCdASoYABAAPxF0sVAsJySisAgBgCIJZwAAUbo/hjY/FWAA/oDhcBnQIOcsrAknuQqqeJ1lDXwuqSnhwyMFUBRRwAAA',
    'assets/solar.c391b72bc407.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACwAwCdASoYAA4APxGCtFIsKaUisAgBgCIJYgCsAB0ydq0I3tyDNAD6jkp3MC8l3xv2447aEUUPAi5tZB8oDW1Mz2MxBPWDeA7vPg1ysnucYIcAAAA=',
    'assets/architecture.jpg':
      'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAwCdASoYABAAPxF0sFAsJySisAgBgCIJQBWAAWcwjdfs6cgYAADMQZlkX3KxN0M8ktF1cjzzVEr+kMCM48Kw7ZP6w0uSeoVfXybz+LNxDqFpCCZWAAAA',
    'assets/reference-projects/reference-commercial-04.jpg':
      'data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAADQBACdASoYABIAPxF4slCsJ6SisAgBgCIJQBjPg2w/DRyinb7b6+b6oyYuo7c/SAD4WDcM/rigJK0ZkqH80SjiN7rw1ZayGEiETVoZEn76gwxH7M3GLmobFO5fZOOOUo04+oMEWRGAAA==',
    'assets/reference-projects/reference-residential-04.jpg':
      'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAwCdASoYABAAPxF0sVCsJqSisAgBgCIJYgCdABE45SRv2Op1YAD3BwbUJdD8hP/KRpXW9bIjRG89C9aKuwcsMPdoVtQ2uP1QxcqrkIroq1yI9E480AAA',
    'assets/reference-projects/reference-commercial-05.jpg':
      'data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAwBACdASoYABAAPxF6tFAsKCUisAgBgCIJQBdgA3SJD4I7gZGOokoxMYAA/lQFkM2clW/X4tFJtOBHolgP852KjerDJ+QDsaDWTHP4IgygAA==',
    'assets/reference-projects/reference-commercial-06.jpg':
      'data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADwAwCdASoYABAAPxF2sVCsJySisAgBgCIJZQAAVNgp2UFynmzT7DGAAP5zvPRLG7fJUg//Fh5Bfzh37vm7pobpkZrsusZ6N256BAAA',
    'assets/reference-projects/reference-commercial-02.jpg':
      'data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADQBACdASoYABIAPwlurVArsSQit/VYAiAhCWMAvzgMIbufE1mHXywSsTte1mtIAAD+cWExQyokH6sv6oj3gnSzmNEBmQHO1hbWWzbEE4wGOPmWH+Hc9EAdzsAAAA==',
    'assets/reference-projects/reference-residential-03.jpg':
      'data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADQAwCdASoYABAAPxF2slEsJySisAgBgCIJQAAKPnLDbpppo42TpXgA+2rsRPc/wX1ZfyO63tpLowzcte9YWDadBGnGz5xGvPBnpsHrAyKHpiZpbkLXrnoAWkg9yaeEazyG1gAA',
    'assets/reference-projects/reference-residential-02.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACwAgCdASoYABAABABoJYgCsADhcvPKsfMTJ6e0qkAA/rn14PdkHX1ftmDIe/KxN9Jd3mGAyg1klDlTCjhmluSufC2ps4Q8YbHv4TCe/G+D6BWAAAA=',
    'assets/reference-projects/reference-commercial-03.jpg':
      'data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAwCdASoYAA4ALtGIxGIkLCwsDADQSxgGFAIc0FXrgZy4qXUaIAD+xLHSkUlajlnPLh3SKgqrV1hF+HwnuDO6p4JgpNtOshMtETtQa+AAAA==',
    'assets/reference-projects/reference-commercial-01.jpg':
      'data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADwBACdASoYABIAPxF2rVGsJyQisBgMAYAiCWUAxzAQ63jrChpBQcV5Srq8STOpBkAA/sSLoPFnIQ+sdfrT54TBo8i6o4OwB0qJfKHENLJY7FPuvnBgfMKqOGcOnZYAAAA=',
    'assets/reference-projects/reference-residential-01.jpg':
      'data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAwCdASoYABAAPxF2slEsJySisAgBgCIJbACdMoADTpK1dKnmTDwAAP5W7040cX05DIvEtVTJahjAcUx5NkdG2vagqBOT/v2/MaMAAAA=',
    'assets/reference-projects/reference-industrial-02.jpg':
      'data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAABwAwCdASoYABAAPxFOv1osIqgkmAGAIgljAABCHllDEUTn5MAA/hWhDcVAHAJBxJoOZdYV/iFGHNdgbtcMy9hRNuwkiBXQxDB33ZCbmf3CB4Gm5pZgAA==',
    'assets/reference-projects/reference-industrial-03.jpg':
      'data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAwAwCdASoYABAALtGIxGIkLCwsDADQSygABcpEOs8Kbvd4AP3jnN0KXjzofCZF1pSULi8qJf6WfgL7fdU9n3r/D2UBzlgSqhgAAA==',
    'assets/reference-projects/reference-industrial-01.jpg':
      'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACwAwCdASoYABAAPxFwsFAsJiSisAgBgCIJZwAAP+kjw8kIDhP4AAD9H5mVqCTlluxMqJQ3WAeqruz5WKq7BS8TIUwTWB+QM4B0BSKXYln4IaAA',
    'assets/solar-catalogue/datasheet-10.jpg':
      'data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAAAwBACdASoRABgAPxF2slGsJySjqA1RgCIJYgCdABElqbuu5TmpwNOSmoAA/rlhX+p8dt/MAPfd1pXmAsBf9SsIK8Z9etLBHjWzRtHuGUrzXpat9lFVwVMKS/dVBuD0Xshypm7GiMjGAAAA',
    'assets/solar-catalogue/datasheet-9.jpg':
      'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAABQBACdASoRABgAPxF2slGsJyoiqA1RgCIJYgC1CTuBhUhlH90VleDINnbAAP65YV/ofdQHkPqhffa9BBTevi7sP5S0ebeRcUVHV/9uFEh/+djES7eghVR0YWYqbHPGrEgT+ftAYwcXl6evZgAAAA==',
    'assets/solar-catalogue/datasheet-8.jpg':
      'data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAABQBACdASoRABgAPxF6sFMsJ6QiqA1RgCIJQBOgAemlPEG0KVXFA3tduiwAAP6ejDyIKxeVkfi6Ps0Tk+R2EFelzlmb3WzcBLP6kcFEYjJXdNNFq5m20cgevp0mADAPQuAoY7soAcUYAAAA',
    'assets/solar-catalogue/datasheet-3.jpg':
      'data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAACwBACdASoSABgAPxF2rVAsJ6QisBgMAYAiCWgAqS1BOlACiRsbAs01v7ePmqhAAPmqF08hpL74jy+w03yZmdo8cbeZjDRicVVjdEyxISlxxSdjNpSfuz+R8KzPJcjPvPC952sWTPt3Mp/RltfSQCAAAAA=',
    'assets/solar-catalogue/datasheet-2.jpg':
      'data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAAAQBACdASoRABgAPxF2sVIsJySiqA1RgCIJYwAAKslGgkOZ8LnfBsdmAAD+05XzEfgS4U6dYA+n8qm74RX/YdGIIi6d5Poj215DShv2Y8WbOoUb84DnvQ/78ujxiVlMzku8LhA6OYAAAA==',
    'assets/solar-catalogue/datasheet-0.jpg':
      'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACQAwCdASoYAAsAPxFwsFAsJiSisAgBgCIJQAAj0d2OSaRsxfgAAP76xLSjXasGaRItj/yU8cJJinVJ2jIaNNwdNdgVdnwA',
    'assets/solar-catalogue/datasheet-1.jpg':
      'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAwAwCdASoYAAgAPxFysFCsJqSnMAgBgCIJYgABSbJD4G0AAP73vjcKZKVZEu1PxRC2jh9S8g/g74gGZG/cqEc6tXQr4bgAAAA=',
    'assets/solar-catalogue/datasheet-5.jpg':
      'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAAAwBACdASoSABgAPw10r1AsJyQisBgMAYAhiWIAsR8OgG8XMLi6hLfHOYAA+aoXPZJXUq9lA36/K3kclbL6vr0+QkJoR78hA6ri5rdnPSCkUoBBxDf24R3tcRPr/tl99tqCA0sf49eYIUFI0aAAAA==',
    'assets/solar-catalogue/datasheet-4.jpg':
      'data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAADQBACdASoSABgAPxF0r1AsJyQisBgMAYAiCWIAnTKEfgAIy+pFIxYMG4jef8VaIAD5qhdK0COozY3azbMuOK+63rg+fryXz9zHX0rgKzO+6Y2tnHxlBQOrh8bMm6ZyARBQhSWR+FxGP0AA',
    'assets/solar-catalogue/datasheet-6.jpg':
      'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAAAwBACdASoSABgAPxF2r1AsJ6QisBgMAYAiCUAAA4YhF7DuMj35PXb7kAAAypH5lRucIhlka1YlPaDnFevEIJQ9xkmL/WMi1ou+VwfqCUD0sRjkz3gSFsPxAFcWVZSwwkGh0KJpP6TK4S4PMr/oiwIt69s0AA==',
    'assets/solar-catalogue/datasheet-7.jpg':
      'data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAAAwBACdASoSABgAPxF8s1QsJ6QjKAqpgCIJQAAFxe6SWl2vdbUgOlv3xZgA/o3xyMvkSYCjykGfOwQH97lIv/Dp7NKtPbkhgd4HMnIX8Pbj3DaosAAAAA==',
    'assets/project-references/ind-marilao.jpg':
      'data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAADwAwCdASoYABAAPxFyslAsJqSisAgBgCIJYwCdABjp0KxXGLZk5ESgAP4kL66w0AmWk0/cuEvWOmIN9LrZPQVTviipQAnaj9h1KxsM3fg3jf2dvQEiFjBH1LOC+AAA',
    'assets/project-references/ind-marikina.jpg':
      'data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADQAwCdASoYABAAPxF4slEsJ6SisAgBgCIJZQC+SBcJp6vj0FqavYAA8bKMpyJNqwvsxaI2y5nZcnHwFLGz3kxsjGjaQOWPAnK4nyRoWOAAAA==',
    'assets/project-references/com-arellano.jpg':
      'data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAABwBQCdASoYABIAPxF4sVKsJyQiqA1RgCIJYgCuVY26sAYdeVkUsPZTciqPnA8HPYpZXhDwAP3t89LDYvy8dty8w8/PijiuXgUM+sG+Cu9MgytDlm4j3Npaawy/+vdbXgpxANPad2A1lCKzyj30BEnAAAA=',
    'assets/project-references/res-cavite-related.jpg':
      'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAwCdASoYAAwAPxF0tFEsJqUisAgBgCIJZQDE2B4iI73qFKHaEdgAAP7L+xWl0f/rga03RUNauRNhdan6ndyUia635aAA',
    'assets/project-references/res-paranaque-related.jpg':
      'data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAwCdASoYABAAPxF0sFAsJySisAgBgCIJbACdACGr8WUfS+SwQUgAAPxSVs2kj7z1NFe88GeCt364hO0Va7/25OtXD5MOD3vqpQFRlj70KO4Fc0txUyxKYIAAAA==',
    'assets/project-references/com-shell.jpg':
      'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAABQBACdASoYABAAPxF0tFAsJyUisAgBgCIJZACdL1yFpZ+zdNOrbT47f+GwAP79AkioxS9WsC8ZU6hmKBr6SS1Ai3OycenthRyOhER0I1DM+r+nDOyIZmfBiHpHnV1ZKRzPouIaiL8318ac7pL5uVCdFkgAAA==',
    'assets/project-references/res-qc-related.jpg':
      'data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQBACdASoYABIAPwluqlArpqOisAwBcCEJZQDIyoADTETebd4vtFNGQAD+Wy7yOtmfQX59FwcZGyDxgFtz2ilBDANLtUeK4ch0ObAA',
    'assets/project-references/res-paranaque.jpg':
      'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACQAwCdASoYAAsAPxF4slEsJ6SisAgBgCIJYwDCgCIdxw5rbvAAAPyOigHzp0ibDIp2Z5WiyMdqy5kC9oViwaAlSKanFdAA',
    'assets/project-references/res-cavite.jpg':
      'data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAABQAwCdASoYAA4ALtGIxGIkLCwsDADQSgCdAEDw4hqpGR+xAAD6h1wOfIMtAs4hYbnxMLTJA5poaYKtysoe9b9NWq7FEwKO3H8zS4uHS1WfnK8Q8oAAAA==',
    'assets/project-references/ind-calamba.jpg':
      'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAACwBACdASoYABIAPwVur1ArpqSisAwBcCCJQBkLg9LC0wOvGMioGqacObK6EvboAP7pQnXs5b12fAea8qCDV1uNNUN5JRp5E9EAybWt1mgsHNIvrtNzzFZyWMMSAy/aFTemHof98Ww5+IOr8PH4AA==',
    'assets/project-references/com-mazda.jpg':
      'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAABQBACdASoYABIAPwVurVArpqQisAwBcCCJZwAAHXDc2/O0cwhOxQhC8jWwAMr/0EEldlRv7o4uO/wCcnKZ0YUDp5XDrR4UuNWjVwLN2El6vcQBPhMAAAAA',
    'assets/project-references/res-qc.jpg':
      'data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADQAwCdASoYAAsAPxF2slEsJySisAgBgCIJZQDG9CHJW/VeryTCzAAA/eNEW7isRqJkOHRaOJMoRnG0ph8b1NumWr+CSR0ah9SgtAAA',
    'assets/project-references/ind-ionics.jpg':
      'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAwBACdASoYAA4APxF4tFGsJyUisAgBgCIJQBOkCYhcWaZf68CoFVDvAYAA/dt+kpQNmXwY3slMnk1H1qjsp2I6AuCX9pQ5yaUtZVWb3aYCp1UdFvAhBcAA',
    'assets/project-references/com-grandunion.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACwBACdASoYABIAPv1oq1ArJiQit/qoAWAfiWUAxNgh105ALa4H+J9UOSfVOPHwAP6OujsIpj4HfF6lo9h9qAcEcLrmRm5LfusoPzqyd9BgUvphgAA=',
    'assets/project-references/ind-dasma.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADQAwCdASoYABAAPxF4tFGsJyUisAgBgCIJYwC7ACP/PCjFd4Hf29AA/d14h/SddADtl5K3lF4n0fddV06bMD9dvMks6SJccLBfGf8RK9mg3PIAAAA=',
    'assets/project-references/ind-carmona.jpg':
      'data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAAAwBACdASoYABIAPxFsslCsJaSisBgMAYAiCWUAtDQCWA/jbGhEq+NEqgAA/NXZUaSyQwTBdVcnyuYb58bWYmyxAeHIaEYzFl6Lq17h9f7mAZO90gQyajSfGZxdYv6lE4Ofkyctq5lbNMb3tSwAAA==',
    'assets/solar-story/lesson-roof.jpg':
      'data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAABQBACdASoYABAAPxFysVCsJqSisAgBgCIJYgCdMoMzGEmeIbGpWU/hum9QAP6MPdimQyWjKVdH9z6xYwDDt1aSVWDJ8z8p1ioaj6s8ywAAAA==',
    'assets/solar-story/neighborhood.jpg':
      'data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAwCdASoYAA0APxF2slEsJySisAgBgCIJZgC2yCHSHPAPhi3gAAD+WyvD2xFu5h9wpfrwJWEga9iS0K5C+6DH/1ttrG3AyaYQsyENP4AAAA==',
    'assets/solar-story/home-selected.jpg':
      'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAwBACdASoQABgAPxFwsFAsJiSisAgBgCIJQBdgA3Yd9pt58kr+7nCiReAA/paqCmLno25VVKmxqhHdGsbyp7nxcdHlbY6TXa7tCUc3EhpWpA1B77+4AAAA',
    'assets/solar-story/lesson-equipment.jpg':
      'data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAwAgCdASoQABgABABoJQBOgCFEjiA/kkHt6AD+4hhQXc1yxe1CzIZthTEmYhDT4HtMfYFKe2VBTfEhp+uU+hGzUfrSNj2edo9uwM6BoAA=',
    'assets/solar-story/industrial.jpg':
      'data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADQAwCdASoYABAAPxF0slCsJqSisAgBgCIJZQDCgCKei1z+RSshroAA/sVboLzNZXefLdhF2b8MVK07u/GpiC97CLkoF+HQiudRfBHEY4vTnH2Mc5NorquK9AA=',
    'assets/solar-story/factory-floor.jpg':
      'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAACwAwCdASoQABgAPxFysFAsJqSisAgBgCIJZwAAUqdGXLHyv04l2AD+6/4XeSUFt/97QopN9mIi9fbbGYTbr6D4YgAAAA==',
    'assets/solar-story/electricity-bill.jpg':
      'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAACQAwCdASoYABAAPxFOv1osIqgkmAGAIgllAABbnyQ7DpU58XdQAP7DuFcdzT90OaLhpvJNsB6MC4gm9bzaSz8EYAAAAA==',
    'assets/solar-story/store-selected.jpg':
      'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAwCdASoYABAAPxF2sVAsJ6SisAgBgCIJQBadBDlvMIoj2q+GHDwA/Oue/pxzvcVlNzIK3IBbN8jP7kQbnOlpaLF/sQjwMEjOjybBobNBvwAA',
    'assets/solar-story/night-home.jpg':
      'data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACwAwCdASoYABAAPxFysFAsJqSisAgBgCIJQBdgBDv3N1BQbkz9AAD+7pC9mKNxCioJbt7yiQDy1nHy+kYAAA==',
    'assets/solar-story/store-interior.jpg':
      'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAwCdASoYABIAPxFys1MsJiSisBgIAYAiCWkAADpsS4EQX1h6LL0AAP7nFjAdGowF7wb2+LQRDOEYPbU2xLQ0AAA=',
    'assets/solar-story/lesson-daytime.jpg':
      'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACwAwCdASoYABAAPxFOv1osIqgkmAGAIgllAABc6pWufboLuZ+EcAD+5wwMccSGWMIUXRadG6iSx0KuUbilYzXr4dhuUmwAgAA=',
    'assets/solar-story/backup.jpg':
      'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAwCdASoQABgAPxFysFAsJqSisAgBgCIJYgC7ACHUnifrS04CH6wA/ujMHZxvhiVBhgsKVtYOAX3DH1VoTvbC+iysQ4GAAAA=',
    'assets/solar-story/essential-light.jpg':
      'data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAABQAwCdASoYABAAPxFysFAsJqSisAgBgCIJZQC3uCHf470BPAD+7nW6tg1lLL8xmn1pt55sjlJAAA==',
    'assets/solar-story/peso-meralco-bill.jpg':
      'data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAACQAgCdASoYABAABABoJQBWABekCqVEnB3gIIll8AD+4iYOL6WxVBlu7srSZnC+NjHm+ElFLPOZ72S6nMb81Fjz+fb23mXoie81gRjmrLFtByp+AxhcSj7bgTzZNy4nJfugAA==',
    'assets/solar-story/roof-shade.jpg':
      'data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAwCdASoYABAAPxF0slCsJqSisAgBgCIJQBOgA9G6JlXcu8wcZNcQAO4VQwYijtP04OQlQ8PczprqrHZZ8J+IkZQlMSUD+j+GLQ7wAAA=',
    'assets/solar-story/daytime.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAwCdASoYABAAPxFysVCsJqSisAgBgCIJZgCdAB8wdGFIptk9aIYAAP7ThfG8bgiJ3JuaMJGaNqdWjrgJ2A8iZ/ctR+WAfCdqYIocb5xh0ZP/kAA=',
    'assets/solar-story/commercial.jpg':
      'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAwCdASoQABgAPxF2sVCsJySisAgBgCIJYwCsACFR52tbKa9a4wAA/ouw++V3Ysgr39CayAycADT8DbmGfdhLxO1wbwnD0Okx5rK7oRBU4AAA',
    'assets/solar-story/evening.jpg':
      'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAwCdASoYABAAPxF2sVAsJ6SisAgBgCIJQBOgA+VgMT+qA2orFlAAnuB/wyHMot0pVz0xIWRv/QGh5tJALIYQNB5urnzVrVDqW+E8yKO3OwAA',
    'assets/solar-story/factory-selected.jpg':
      'data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAwCdASoQABgAPxF0tFAsJyUisAgBgCIJYwABFYr3zPBKMRmiAAD+56zd3Fqm8Ee5i6QbJaVw2oCwqsu7sZDyLf9o0YnDSJs17hrwDTuwAA==',
    'assets/solar-story/peso-electricity-bill.jpg':
      'data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAACwBACdASoSABgAPxF6tlOsJ6UiqAqpgCIJQBOmWefqA7u3AWsd/loeXsG7cBIWAPUR7ij0rMVI+shK8Vj/A3eFAJSok+pgaCI0FtpgQJxL6y+4jJgoFiBJ2VY01QD90I4HSAAA',
    'assets/solar-story/residential.jpg':
      'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAwCdASoQABgAPxF0sFCsJqSisAgBgCIJQAALfVWw2CBLVH21oUAA/tDO1JcTlwA/TWD2iV1GcRvSfcn6XcrY+K6o+lGS6REtoZcHX7k0AAAA',
    'assets/solar-story/lower-bills.jpg':
      'data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQBACdASoQABgAPxF0sVCsJqSisAgBgCIJQBadBHtO6mexRjEu0ANaAAD8jHn9+00IQ2KRWMe9lWTyIHIzLutt4lJCuNnhk5SzETXFozdXG2r87buAZMSAAAA=',
    'assets/solar-story/stored-energy.jpg':
      'data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQBACdASoYABAAPxFysFAsJqSisAgBgCIJaACdABVVCj1zickukKTNQAD+y9YRl+iGol+buGUllOY4eYcQuqqdiHkyr0wSfZyZLyjJfMZbNYY5YUcJi8P6vA22CJBTVl9CroAA',
    'assets/skyworth-products/hybrid-hv.png':
      'data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAwBACdASoYABYAPwVuq1ArpqOisAwBcCCJaQAAW+tDqCk67QPcqBH8WgAA/u+0rsvWwJKSsToLUj0vwAAAAA==',
    'assets/skyworth-products/battery-hv.png':
      'data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACQAwCdASoYABYAPxF0sVCsJqSisAgBgCIJaQAAcg/+jcYPh9aAAP7vS4uE2EJA5isx5PowPODHalAAAAA=',
    'assets/skyworth-products/inverters.jpg':
      'data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAABwAwCdASoYAAoALtGIxGIkLCwsDADQSxgABcX4d1gjXmx8LgAA/trQ25kNMT85fcuW7o/W7/zsId9NfTr+mA5ENmuaC6GQv2jwAA==',
    'assets/skyworth-products/panels.jpg':
      'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAACQAwCdASoYAAsAPxGCtFIsKaUisAgBgCIJZQDG9C0I36fzTRwAAP7sLxcij9REg8Ktq1eG+x3F2SR/BwRaGqnLeAAAAA==',
    'assets/skyworth-products/module-g12.png':
      'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAABQBACdASoYABcAPwl4sFArqCSisAwBcCEJaQAAW+vCL7dcEMnYqZMQ9YkAAP7v1VOnBO8u8ul2cZ06rkw57UrAc+KaUAAA',
    'assets/skyworth-products/ongrid-40-60.png':
      'data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAACQBACdASoYABYAPv1krVArJSSit/qoAWAfiWkAAFu1D+aDyyaXsvSZMF5O2GAA/vHbTx1AUMxSJAREqweELzCQ6sXwLsSAXRywwAAA',
    'assets/skyworth-products/module-m10.png':
      'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAwCdASoYABcAPxFoxGIsJCgoFAGAIglpAADdQ/1/HzucamYBkrAAAP72C197jED9nYW6F0rAuNDGAPwc+og4064Ip4AAAAA=',
    'assets/skyworth-products/hybrid-lv.png':
      'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAABQBACdASoYABYAPxF6tVOsJ6UiqAqpgCIJaQAALnS50G0yc8iBGRms/0UAAP7tOdylj9I/GQhzpK2pIXZ/Y91TiDIAAAAA',
    'assets/skyworth-products/module-g12r.png':
      'data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAABwBACdASoYABcAPwlor1ArpaQit/VYAXAhCWkAACVEHzfd41yYR8F8znpAYAD+79dGvIyan9ndw9jxohIR7gGKzgR1Bwg9J6MSIt0AAAA=',
    'assets/skyworth-products/batteries.jpg':
      'data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAwCdASoYAAoAPxFOv1osIqgkmAGAIglnAMoAIci7yRN7Pk8B9wAA/uvk24mR3Por52JPCp9yHlwlM2uViqguqTShWx8jxAAAAA==',
    'assets/skyworth-products/ongrid-30-50.png':
      'data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAABQBACdASoYABcAPvVoqVAqpqQit+gBUB6JaQAAiJ7ue3JZae2kZ6cvqfAAAP7xyeGvlvoM+OCOcmKpKe0AAAAA',
    'assets/skyworth-products/storage-cabinet.png':
      'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAAAQAwCdASoYABYAPxF4slIsJySiqA1RgCIJaQAAPBasrMAA/u9MIS0TCwzenm5w61bkbgAA',
    'assets/solar-models/model-8.jpg':
      'data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAQBACdASoMABgAPxF0tFEsJqUisAgBgCIJQBYdhH+crdjM6jNKMea8AADMS0LgGGG/ePCpWmhnyKv+rxqmsDIW+JirM/Pw+XSe9OYQAAA=',
    'assets/solar-models/model-9.jpg':
      'data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAACwAwCdASoNABgAPxF6tFAsKCUisAgBgCIJZACdAGk8QtR88fpMAADicKO78O/D8DLzGGIY1CS6Rjj6E8qY+oI2n275rKFGal30GBgqNlWKVkD83tLBenZKDAAAAA==',
    'assets/solar-models/swr-low.png':
      'data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAwCdASoWABgAPwlwqVArpqOisAwBcCEJaQAAXKEYmg/xCDOvwjAA/u/RLzItfhYSwkk0P8rNbrvNwctwX7TEPSKXRNijG8AAAA==',
    'assets/solar-models/model-4.jpg':
      'data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAADQAwCdASoYABQAPxF2rlAsJ6QisBgMAYAiCWMAqSdkAajOJD8okgAA/d38RgRE0PKABOQBAi+yuYh+XsYUMs5zZflpJrWa36z1cuTPZxnlVjBSCnWB7Zhx9yEUBqklFZwAAA==',
    'assets/solar-models/model-5.jpg':
      'data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAACQBACdASoYABIAPwVsrlArpiSisAwBcCCJQBOmX9anCDMoYGfETTw+tk1j9xwA/p68dzW18mzE0hzcUNxQRvfzRuvyBBWcu8d1UQDUhSFsu729C2I7ONuJaq6u2nQmI3P4hs794oURZ9QDfCT/kH1QAAA=',
    'assets/solar-models/swr-residential.png':
      'data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAwCdASoYABgAPw1ws1AsJqUisBgMAYAhiWkAADywKFU2k/2rgAD+77HXS9JPTC0kEvb+ZoAAAA==',
    'assets/solar-models/commercial-storage.png':
      'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAABwBACdASoYABgAPxF8t1QsJ6UjKAqpgCIJaQAAJcMdQEL9+ZLnJglsAIwgAAD+7WEEtOQDqkN85A1L4enp+ucTfCZ9TS+VpM9Aw3x4dNzQ4AAA',
    'assets/solar-models/model-10.jpg':
      'data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACQAwCdASoNABgALtGIxGIkLCwsDADQSyAE6AIbuWPASXGGBvYAAOIfQaMPfF/F20zSKCfaqVMyaH4o+6C++vPyaitJ0RjnnUUD7mUc09YsNAAA',
    'assets/solar-models/hybrid-sr.png':
      'data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAACQBACdASoYABgAPw12s1AsJ6UisBgMAYAhiWkAACnXWBRZyfdT2lFfTGHyWfAA/u3Ply76wDufu+w3qnKG9WDXLAQreMPhhcOVLJIaU0g96vAXyOusarJMugAAAA==',
    'assets/Techouse Images/Techouse_Logo_withLettering.png':
      'data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAABQBACdASoYABEAPxF8s1IsKCSisBgIAYAiCWcAAC3P7qLX5mXriPjrOBQgAP7tSEZNHXztF0JNS4dKxZ9N358HN0o/WJlJSldtoDi8AAA=',
    'assets/Techouse Images/Techouse_Logo.png':
      'data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAADwBACdASoYABgAPw1yslAsJySisBgMAYAhiWQAACVeC4/Oe0WYJeWS8yk4suDNowAA/u/XlHWFPiENOUuqSunB4xkwdQeYg35UDXIFZ+uWBuv/hrd/NMa+Y5e82Yc/dD6PDQEBZyGpHiJ06BpwC5ZxgPfxeQcomXdWVJTyuxPVY79hsUtOlBEtdGzKsUcPlQIV7GsvSuAAAA==',
    'assets/Techouse Images/Prefab.jpg':
      'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACQBACdASoYABMAPv1mq1ArJaQmt/qoAWAfiWcAxvQhXOe5KZ6pdgGjp6AVEgAA/tM38GgzWKxSgI75FDsz/q/b4L1zUBb36Nnk4Rhi0DUDCS5UnetqUAAA',
    'assets/Techouse Images/1782790162673777.png':
      'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACwAwCdASoYAAoAPxF0tFAsJyUisAgBgCIJZwAAUkl2P7hzAtqcAADhgT3Vf6FDWjMJtfPTn4EyZZBqSUgo774CAAA=',
    'assets/Techouse Images/Elevator.png':
      'data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAQBACdASoYAA8APxFysVAsJqSisAgBgCIJZQCdACGH98WjGibKCm3dAAD7mmxEzYvLUqk4CI8Vwa+KxOjr3GvXBcCDaGl7c9MX975du6pcIKIrbWFOG6tpjlTQgqAA',
    'assets/Techouse Images/1782791168445233.jpg':
      'data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACQAwCdASoYAAoALtGIxGIkLCwsDADQSygABdoy/01S1CHRx6iAAP7WcDdNhD0CydHRPV6brRtDX2Z2YvFLvZ7KzfRxk12QAAA=',
    'assets/Techouse Images/1749199449203839.png':
      'data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAADQAwCdASoQABgAPxFysFAsJqSisAgBgCIJaACdACD08JEAlUBNBGgA/UVPbWxvKJt/JHo+nyv70faI+fm+5GZPr8h6IocJUM/dneLB3tSJ9ds617UKR4sT0gSkYAAA',
    'assets/Techouse Images/Elevator.b55adcb70afa.webp':
      'data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAQBACdASoYAA8APxFysVAsJqSisAgBgCIJZQCdACGH98WjGibKCm3dAAD7mmxEzYvLUqk4CI8Vwa+KxOjr3GvXBcCDaGl7c9MX975du6pcIKIrbWFOG6tpjlTQgqAA',
    'assets/Techouse Images/Skyworth_Logo.jpg':
      'data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADwAgCdASoYABgAPxF6tlMsJ6WiqAqpgCIJZQAAO5L4IAD+8ALOf7qZdjU+nyg/XLvQsEezgWOBoAAA',
    'assets/Techouse Images/1749199451196735.png':
      'data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAAAQBACdASoQABgAPxF0sFCsJqSisAgBgCIJYgCdMoABWXW5YAUcry7mgAD+dyFuUqmu6ng+6XGgzSsi1BW2B0jwaPfteCeMKXSaog32AaxRTo9CfgBBZ1AXwgAAAA==',
    'assets/Techouse Images/Skyworth_Logo_withLettering.jpg':
      'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAACQAwCdASoYAAcAPxF0slCsJqSisAgBgCIJQBOiP/wHkTyeQgSAAP6ztMFqXebYNai2WC0dA1TPQ80/sdRfsk14P7c1Rfzcevzb5fzpT6UeBbMAAAA=',
  };
  const sources = new WeakMap();
  function prepare(img) {
    const source = img.getAttribute('src');
    if (!source || sources.get(img) === source) return;
    sources.set(img, source);
    let path;
    try {
      path = decodeURIComponent(new URL(source, location.href).pathname).replace(/^\//, '');
    } catch {
      return;
    }
    const preview = previews[path];
    img.style.backgroundImage = preview ? `url("${preview}")` : '';
    img.style.backgroundSize = 'cover';
    img.style.backgroundPosition = 'center';
    const pending = !img.complete;
    const reveal = () => {
      if (sources.get(img) !== source || !img.naturalWidth) return;
      img.style.backgroundImage = '';
      img.dataset.previewState = 'ready';
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && pending)
        img.animate([{ filter: 'blur(3px)' }, { filter: 'blur(0)' }], {
          duration: 220,
          easing: 'ease-out',
        });
    };
    img.dataset.previewState = 'loading';
    if (img.complete) reveal();
    else img.addEventListener('load', reveal, { once: true });
  }
  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.matches('img')) prepare(node);
    node.querySelectorAll('img').forEach(prepare);
  }
  const main = document.querySelector('main');
  if (!main) return;
  scan(main);
  new MutationObserver((records) =>
    records.forEach((record) => {
      if (record.type === 'attributes') prepare(record.target);
      else record.addedNodes.forEach(scan);
    }),
  ).observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
})();
