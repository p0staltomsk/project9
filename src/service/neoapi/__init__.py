try:
    from neoapi_sdk import NeoApiClientAsync, track_llm_output
except ImportError:
    try:
        from neoapi-sdk import NeoApiClientAsync, track_llm_output  # попробуем с дефисом
    except ImportError:
        raise ImportError("Не удалось импортировать neoapi_sdk. Проверьте установку пакета.")

__all__ = ['NeoApiClientAsync', 'track_llm_output']
