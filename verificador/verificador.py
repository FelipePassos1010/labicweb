import pandas as pd
import os
import watchdog.events
import watchdog.observers
import time

class Handler(watchdog.events.PatternMatchingEventHandler):
    def __init__(self):
        # Define os padrões para PatternMatchingEventHandler
        watchdog.events.PatternMatchingEventHandler.__init__(self, patterns=['*.csv'],
                                                             ignore_directories=True, case_sensitive=False)

    def on_created(self, event):
        print(f"Novo arquivo detectado: {event.src_path}")
        # Processa o novo arquivo CSV
        self.process_new_csv(event.src_path)

    def process_new_csv(self, path):
        # Ignora o processamento se o arquivo já é uma versão modificada
        if '_modified.csv' in path:
            return

        try:
            # Tenta ler o arquivo CSV com o delimitador padrão (,) e considera a primeira linha como cabeçalho
            df = pd.read_csv(path, delimiter=',', header=0)
        except pd.errors.ParserError as e:
            print(f"Erro ao ler o arquivo {path}: {e}")
            return  # Sai da função se ocorrer um erro ao ler o arquivo
        
        # Gera o novo nome de arquivo
        new_path = os.path.splitext(path)[0] + '_modified.csv'
        
        try:
            # Tenta escrever o arquivo com o novo delimitador (/), mantendo os nomes das colunas
            df.to_csv(new_path, sep='/', index=False)
            print(f"Arquivo modificado criado: {new_path}")
        except Exception as e:
            print(f"Erro ao escrever o arquivo {new_path}: {e}")


if __name__ == "__main__":
    src_path = r"C:\Users\Labic\Desktop\teste1.0"  # Modifique para o caminho do diretório que deseja monitorar
    event_handler = Handler()
    observer = watchdog.observers.Observer()
    observer.schedule(event_handler, path=src_path, recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1) # observará a pasta a cada 1s 
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
