import { Providers } from "@app/providers";
import { HomePage } from "@pages/home/ui/HomePage";

function App() {
  return (
    <Providers>
      <HomePage />
    </Providers>
  );
}

export default App;
