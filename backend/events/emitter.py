"""
Simple in-process event bus for the application.
Events are handled asynchronously via registered handlers.
"""
import asyncio
from typing import Callable, Any

_handlers: dict[str, list[Callable]] = {}


def on(event_type: str, handler: Callable):
    """Register an event handler."""
    if event_type not in _handlers:
        _handlers[event_type] = []
    _handlers[event_type].append(handler)


async def emit_event(event_type: str, data: dict[str, Any]):
    """Emit an event to all registered handlers."""
    handlers = _handlers.get(event_type, [])
    for handler in handlers:
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(data)
            else:
                handler(data)
        except Exception as e:
            print(f"[Event Error] {event_type}: {e}")
