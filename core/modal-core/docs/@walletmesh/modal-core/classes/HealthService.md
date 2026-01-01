[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / HealthService

# Class: HealthService

Health monitoring and recovery service

Monitors connection health and provides recovery strategies.

## Constructors

### Constructor

> **new HealthService**(`dependencies`, `config`): `HealthService`

#### Parameters

##### dependencies

[`HealthServiceDependencies`](../interfaces/HealthServiceDependencies.md)

##### config

[`HealthMonitoringConfig`](../interfaces/HealthMonitoringConfig.md) = `{}`

#### Returns

`HealthService`

## Methods

### analyzeError()

> **analyzeError**(`error`, `attemptCount`): [`ErrorAnalysis`](../interfaces/ErrorAnalysis.md)

Analyze error and suggest recovery strategy

#### Parameters

##### error

`Error`

##### attemptCount

`number` = `0`

#### Returns

[`ErrorAnalysis`](../interfaces/ErrorAnalysis.md)

***

### checkHealth()

> **checkHealth**(`provider`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`HealthDiagnostics`](../interfaces/HealthDiagnostics.md)\>

Check provider health

#### Parameters

##### provider

`unknown`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`HealthDiagnostics`](../interfaces/HealthDiagnostics.md)\>

***

### classifyError()

> **classifyError**(`error`): [`ErrorClassification`](../type-aliases/ErrorClassification.md)

Classify an error

#### Parameters

##### error

`Error`

#### Returns

[`ErrorClassification`](../type-aliases/ErrorClassification.md)

***

### getDiagnostics()

> **getDiagnostics**(): [`HealthDiagnostics`](../interfaces/HealthDiagnostics.md)

Get current health diagnostics

#### Returns

[`HealthDiagnostics`](../interfaces/HealthDiagnostics.md)

***

### getHealthSummary()

> **getHealthSummary**(): `object`

Get health summary

#### Returns

`object`

##### avgResponseTime

> **avgResponseTime**: `number`

##### errorRate

> **errorRate**: `number`

##### issueCount

> **issueCount**: `number`

##### networkStatus

> **networkStatus**: [`NetworkStatus`](../type-aliases/NetworkStatus.md)

##### status

> **status**: [`HealthStatus`](../type-aliases/HealthStatus.md)

***

### getRecoveryState()

> **getRecoveryState**(): [`RecoveryState`](../interfaces/RecoveryState.md)

Get recovery state

#### Returns

[`RecoveryState`](../interfaces/RecoveryState.md)

***

### recordRecoveryAttempt()

> **recordRecoveryAttempt**(`strategy`, `success`, `error?`, `duration?`): `void`

Record recovery attempt

#### Parameters

##### strategy

[`RecoveryStrategy`](../type-aliases/RecoveryStrategy.md)

##### success

`boolean`

##### error?

`Error`

##### duration?

`number` = `0`

#### Returns

`void`

***

### resetMetrics()

> **resetMetrics**(): `void`

Reset health metrics

#### Returns

`void`

***

### startRecovery()

> **startRecovery**(): `void`

Start recovery process

#### Returns

`void`

***

### stopRecovery()

> **stopRecovery**(): `void`

Stop recovery process

#### Returns

`void`
