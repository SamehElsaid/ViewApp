import control from 'src/Components/img/control.png'
import texture from 'src/Components/img/texture-1.png'

function LoadingMain({ login }) {
  return (
    <div
      style={{ zIndex: 22222222 }}
      className={`${
        login ? '' : 'opacity-0 invisible'
      } flex || items-center overflow-hidden || justify-center duration-500 fixed inset-0 bg-linear`}
    >
      <div className='absolute top-0 left-0' style={{ zIndex: 1 }}>
        <img style={{ filter: 'invert(1)' }} src={texture.src} alt='texture' />
      </div>
      <div
        className='loader22 '
        dangerouslySetInnerHTML={{
          __html: `<div >
                    <div style="--i: 1; --inset:44%" class="box">
                      <div class="logo bg-white rounded-full p-1">
                        <img src=${control.src} alt='control' />
                      </div>
                    </div>
                    <div style="--i: 2; --inset:40%" class="box"></div>
                    <div style="--i: 3; --inset:36%" class="box"></div>
                    <div style="--i: 4; --inset:32%" class="box"></div>
                    <div style="--i: 5; --inset:28%" class="box"></div>
                    <div style="--i: 6; --inset:24%" class="box"></div>
                    <div style="--i: 7; --inset:20%" class="box"></div>
                    <div style="--i: 8; --inset:16%" class="box"></div>
                  </div>
            `
        }}
      ></div>
      <div className='flex absolute right-0 bottom-0 justify-end' style={{ zIndex: 1 }}>
        <img style={{ rotate: '180deg' }} src={texture.src} alt='texture' />
      </div>
    </div>
  )
}

export default LoadingMain