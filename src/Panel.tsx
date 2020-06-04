import React, { useState, useEffect } from 'react';
import { useStoreState } from 'pullstate';
import { createUseStyles } from 'react-jss';
import { ExtensionStore } from './stores/ExtensionStore';
import { Header } from './components/Header';
import { MainPanel } from './pages/MainPanel';
import { SelectInstance } from './pages/SelectInstance';
import { requestAPI } from './utils/ApiRequest';
import { Instance } from './types';
import { Spinning } from './components/Spinning';

const useStyles = createUseStyles({
  panel: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  section: {
    flex: 1
  },
  loading: {
    padding: '8px 16px 8px 16px'
  },
  icon: {
    fontSize: '10pt',
    verticalAlign: 'middle'
  },
  iconText: {
    verticalAlign: 'middle',
    paddingLeft: '4px'
  }
});

export const Panel: React.FunctionComponent = () => {
  const classes = useStyles();
  const activeInstance = useStoreState(ExtensionStore, s => s.activeInstance);

  const [instances, setInstances] = useState<Instance[]>(undefined);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = () => {
    requestAPI<{ activeInstance?: string; instances: Instance[] }>('instances')
      .then(({ activeInstance, instances }) =>
        instancesLoaded(activeInstance, instances)
      )
      .catch(e => console.log(e));
  };

  const instancesLoaded = (activeInstance: string, instances: Instance[]) => {
    const objActiveInstance = instances.find(i => i.name === activeInstance);
    if (objActiveInstance) {
      console.log('Active instance: ', activeInstance);

      ExtensionStore.update(s => {
        s.activeInstance = objActiveInstance;
      });
    }

    setInstances(instances);
  };

  const setActiveInstance = (value?: string) => {
    ExtensionStore.update(s => {
      const instance = instances.find(i => i.name === value);
      s.activeInstance = instance;
    });

    const init = {
      method: 'PUT',
      body: JSON.stringify({
        instance: value
      })
    };

    requestAPI('instances', init).catch(e => console.log(e));
  };

  return (
    <div className={classes.panel}>
      <Header />
      {!!activeInstance && <MainPanel />}
      {!instances && (
        <div className={classes.loading}>
          <Spinning className={`${classes.icon} material-icons`}>
            hourglass_top
          </Spinning>
          <span className={classes.iconText}>Loading...</span>
        </div>
      )}
      {!activeInstance && !!instances && (
        <SelectInstance
          instances={instances}
          onSelectInstance={setActiveInstance}
        />
      )}
    </div>
  );
};